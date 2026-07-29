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
    await fs.promises.rm(temporaryPath, { force: true });
    try {
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Markdown AI: Downloading local model…', cancellable: true }, async (progress, token) => {
            const controller = new AbortController();
            token.onCancellationRequested(() => controller.abort());
            const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
            if (!response.ok || !response.body) {
                throw new Error(`Model download failed with HTTP ${response.status}.`);
            }
            const total = Number(response.headers.get('content-length'));
            let received = 0;
            const meter = new TransformStream<Uint8Array, Uint8Array>({
                transform(chunk, controller) {
                    received += chunk.byteLength;
                    progress.report(Number.isFinite(total) && total > 0 ? { increment: (chunk.byteLength / total) * 100 } : { message: `${Math.round(received / 1024 / 1024)} MB downloaded` });
                    controller.enqueue(chunk);
                },
            });
            await pipeline(Readable.fromWeb(response.body as never), meter.readable as never, fs.createWriteStream(temporaryPath));
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
        await fs.promises.rm(temporaryPath, { force: true });
        throw error;
    }
}

async function waitForServer(baseUrl: string, child: ChildProcess): Promise<void> {
    const deadline = Date.now() + START_TIMEOUT_MS;
    while (Date.now() < deadline) {
        if (child.exitCode !== null || child.killed) {
            throw new Error(`Local model stopped during startup (${child.exitCode ?? 'terminated'}).`);
        }
        try {
            if ((await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(3_000) })).ok) {
                return;
            }
        } catch { /* Server is still starting. */ }
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Local model did not become ready within 90 seconds.');
}

async function start(context: vscode.ExtensionContext): Promise<string> {
    const modelPath = await ensureModel(context);
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
        await waitForServer(baseUrl, child);
        return baseUrl;
    } catch (error) {
        child.kill();
        throw error;
    }
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
