import { createHash } from 'crypto';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import * as vscode from 'vscode';

const DEFAULT_MODEL_URL = 'https://huggingface.co/mozilla-ai/Llama-3.2-1B-Instruct-llamafile/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.llamafile';
const DEFAULT_MODEL_SHA256 = 'ac1c2864000bad7f62ee56ee908d3f55dd051a267d015b15fa6e831e69767b55';
const MIN_MODEL_BYTES = 100 * 1024 * 1024;
const DOWNLOAD_STALL_TIMEOUT_MS = 30_000;
const START_TIMEOUT_MS = 90_000;
let processRef: ChildProcess | undefined;
let port: number | undefined;
let starting: Promise<string> | undefined;

function fileSha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.once('error', reject);
        stream.on('data', (chunk) => { hash.update(chunk); });
        stream.once('end', () => resolve(hash.digest('hex')));
    });
}

function freePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            server.close((error) => error ? reject(error) : typeof address === 'object' && address ? resolve(address.port) : reject(new Error('Could not reserve a local port.')));
        });
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function ensureModel(context: vscode.ExtensionContext): Promise<string> {
    const modelPath = path.join(context.globalStorageUri.fsPath, 'markdown-ai-model.llamafile');
    const installedMarker = `${modelPath}.installed`;
    if (fs.existsSync(modelPath) && fs.existsSync(installedMarker) && (await fs.promises.stat(modelPath)).size >= MIN_MODEL_BYTES) {
        try {
            const marker = JSON.parse(await fs.promises.readFile(installedMarker, 'utf8')) as { sha256?: string };
            if (typeof marker.sha256 === 'string' && await fileSha256(modelPath) === marker.sha256) {
                return modelPath;
            }
        } catch {
            // Treat an unreadable marker as an untrusted cache entry.
        }
        await fs.promises.rm(installedMarker, { force: true });
    }

    const answer = await vscode.window.showInformationMessage(
        'Markdown AI needs to download its local Llama 3.2 1B model (about 1.12 GB). Document text stays on your computer when using this engine.',
        { modal: true },
        'Download model',
        'Use custom endpoint'
    );
    if (answer === 'Use custom endpoint') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'markdownAi.useManagedEngine');
    }
    if (answer !== 'Download model') {
        throw new Error('Model download was not approved. Configure a custom endpoint or run the command again.');
    }

    const configuredUrl = vscode.workspace.getConfiguration('markdownAi').get<string>('managedModelUrl', DEFAULT_MODEL_URL);
    const expectedSha256 = vscode.workspace.getConfiguration('markdownAi').get<string>('managedModelSha256', DEFAULT_MODEL_SHA256).trim().toLowerCase();
    const url = new URL(configuredUrl);
    if (url.protocol !== 'https:') {
        throw new Error('markdownAi.managedModelUrl must use HTTPS.');
    }
    await fs.promises.mkdir(path.dirname(modelPath), { recursive: true });
    const temporaryPath = `${modelPath}.download`;
    const existingDownloadSize = fs.existsSync(temporaryPath) ? (await fs.promises.stat(temporaryPath)).size : 0;
    try {
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Markdown AI: Downloading local model…', cancellable: true }, async (progress, token) => {
            const controller = new AbortController();
            let cancelled = false;
            let stalled = false;
            let stallTimer: ReturnType<typeof setTimeout> | undefined;
            token.onCancellationRequested(() => {
                cancelled = true;
                controller.abort();
            });
            const requestHeaders: Record<string, string> = existingDownloadSize > 0 ? { Range: `bytes=${existingDownloadSize}-` } : {};
            let responseTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
                stalled = true;
                controller.abort();
            }, DOWNLOAD_STALL_TIMEOUT_MS);
            let response: Response;
            try {
                response = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: requestHeaders });
            } catch (error) {
                if (cancelled) {
                    throw new Error('Model download was canceled. Run the command again to resume it.');
                }
                if (stalled) {
                    throw new Error(`Model download stalled for ${DOWNLOAD_STALL_TIMEOUT_MS / 1000} seconds before receiving data. Check your connection and try again.`);
                }
                throw error;
            } finally {
                if (responseTimer) {
                    clearTimeout(responseTimer);
                    responseTimer = undefined;
                }
            }
            if (response.status === 416 && existingDownloadSize > 0) {
                await fs.promises.rm(temporaryPath, { force: true });
                throw new Error('The partial model download could not be resumed. Run the command again to restart it.');
            }
            if (!response.ok || !response.body) {
                throw new Error(`Model download failed with HTTP ${response.status}.`);
            }
            const append = existingDownloadSize > 0 && response.status === 206;
            const startingBytes = append ? existingDownloadSize : 0;
            const responseBytes = Number(response.headers.get('content-length'));
            const total = Number.isFinite(responseBytes) && responseBytes > 0 ? startingBytes + responseBytes : undefined;
            let received = startingBytes;
            let lastReportedBytes = startingBytes;
            let lastReportAt = Date.now();
            progress.report({ message: `${append ? 'Resuming' : 'Downloading'} model: ${formatBytes(received)} downloaded` });
            const resetStallTimer = () => {
                if (stallTimer) {
                    clearTimeout(stallTimer);
                }
                stallTimer = setTimeout(() => {
                    stalled = true;
                    controller.abort();
                }, DOWNLOAD_STALL_TIMEOUT_MS);
            };
            resetStallTimer();
            const meter = new TransformStream<Uint8Array, Uint8Array>({
                transform(chunk, transformController) {
                    resetStallTimer();
                    received += chunk.byteLength;
                    const now = Date.now();
                    if (now - lastReportAt >= 500) {
                        const seconds = Math.max((now - lastReportAt) / 1000, 0.001);
                        const speed = (received - lastReportedBytes) / seconds;
                        const percentage = total ? ` (${Math.floor((received / total) * 100)}%)` : '';
                        progress.report({ message: `${formatBytes(received)} downloaded${percentage} (${formatBytes(speed)}/s)` });
                        lastReportedBytes = received;
                        lastReportAt = now;
                    }
                    transformController.enqueue(chunk);
                },
            });
            try {
                await pipeline(Readable.fromWeb(response.body as never), meter.readable as never, fs.createWriteStream(temporaryPath, { flags: append ? 'a' : 'w' }));
            } catch (error) {
                if (cancelled) {
                    throw new Error('Model download was canceled. Run the command again to resume it.');
                }
                if (stalled) {
                    throw new Error(`Model download stalled for ${DOWNLOAD_STALL_TIMEOUT_MS / 1000} seconds. Check your connection and try again to resume it.`);
                }
                throw error;
            } finally {
                if (stallTimer) {
                    clearTimeout(stallTimer);
                }
            }
        });
        if ((await fs.promises.stat(temporaryPath)).size < MIN_MODEL_BYTES) {
            throw new Error('Downloaded model is unexpectedly small and was not installed.');
        }
        if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
            throw new Error('markdownAi.managedModelSha256 must be a 64-character SHA-256 digest.');
        }
        if (await fileSha256(temporaryPath) !== expectedSha256) {
            throw new Error('Downloaded model failed its SHA-256 integrity check and was not installed.');
        }
        await fs.promises.rm(modelPath, { force: true });
        await fs.promises.rm(installedMarker, { force: true });
        await fs.promises.rename(temporaryPath, modelPath);
        if (process.platform !== 'win32') {
            await fs.promises.chmod(modelPath, 0o755);
        }
        await fs.promises.writeFile(installedMarker, JSON.stringify({ source: url.toString(), sha256: expectedSha256, installedAt: new Date().toISOString() }), 'utf8');
        return modelPath;
    } catch (error) {
        throw error;
    }
}

async function waitForServer(baseUrl: string, child: ChildProcess, progress: vscode.Progress<{ message?: string }>): Promise<void> {
    const deadline = Date.now() + START_TIMEOUT_MS;
    const startedAt = Date.now();
    while (Date.now() < deadline) {
        if (child.exitCode !== null || child.killed) {
            throw new Error(`Local model stopped during startup (${child.exitCode ?? 'terminated'}).`);
        }
        try {
            if ((await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(3_000) })).ok) {
                return;
            }
        } catch { /* Server is still starting. */ }
        progress.report({ message: `Starting local model… ${Math.floor((Date.now() - startedAt) / 1000)}s` });
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Local model did not become ready within 90 seconds.');
}

async function start(context: vscode.ExtensionContext): Promise<string> {
    return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Markdown AI: Preparing local model…', cancellable: false }, async (progress) => {
        progress.report({ message: 'Checking local model…' });
        const modelPath = await ensureModel(context);
        progress.report({ message: 'Starting local model…' });
        const localPort = await freePort();
        const baseUrl = `http://127.0.0.1:${localPort}/v1`;
        const child = spawn(modelPath, ['--server', '--nobrowser', '--host', '127.0.0.1', '--port', String(localPort), '--ctx-size', '4096'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
        processRef = child;
        port = localPort;
        child.stderr?.on('data', (data: Buffer) => console.debug(`[Markdown AI engine] ${data.toString()}`));
        child.once('exit', () => {
            if (processRef === child) {
                processRef = undefined;
                port = undefined;
            }
        });
        try {
            await waitForServer(baseUrl, child, progress);
            return baseUrl;
        } catch (error) {
            child.kill();
            throw error;
        }
    });
}

export async function startManagedEngine(context: vscode.ExtensionContext): Promise<string> {
    if (processRef && port && processRef.exitCode === null) {
        return `http://127.0.0.1:${port}/v1`;
    }
    starting ??= start(context).finally(() => { starting = undefined; });
    return starting;
}

export function stopManagedEngine(): void {
    processRef?.kill();
    processRef = undefined;
    port = undefined;
}
