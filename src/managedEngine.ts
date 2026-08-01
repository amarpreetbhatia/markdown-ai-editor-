import { createHash } from 'crypto';
import { spawn, type ChildProcess, execFile } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { defaultModel, selectRuntime, type DownloadAsset, type RuntimeAsset } from './modelCatalog';

type LocalModelState = 'not-installed' | 'downloading' | 'ready' | 'failed' | 'unsupported-platform';

interface InstallationMarker {
    modelSha256: string;
    runtimeSha256: string;
    executable: string;
}

const execFileAsync = promisify(execFile);
const connectionTimeoutMs = 30_000;
let state: LocalModelState = 'not-installed';
let detail = 'Local model setup has not started.';
let installationPromise: Promise<void> | undefined;
let serverPromise: Promise<string> | undefined;
let server: ChildProcess | undefined;
let statusBar: vscode.StatusBarItem | undefined;
let downloadController: AbortController | undefined;

async function requestSetupApproval(context: vscode.ExtensionContext): Promise<boolean> {
    if (context.globalState.get<boolean>('markdownAi.managedSetupApproved', false)) {
        return true;
    }
    const choice = await vscode.window.showInformationMessage(
        `Markdown AI can download a ${defaultModel.displayName} writing model (about 271 MB) and its local runtime. The first setup needs internet; editing works offline after that.`,
        'Set up local model',
        'Use custom endpoint',
        'Not now',
    );
    if (choice === 'Set up local model') {
        await context.globalState.update('markdownAi.managedSetupApproved', true);
        return true;
    }
    if (choice === 'Use custom endpoint') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'markdownAi.useManagedEngine');
    }
    return false;
}

function storagePaths(context: vscode.ExtensionContext): { root: string; model: string; runtime: string; marker: string } {
    const root = path.join(context.globalStorageUri.fsPath, 'local-model');
    return {
        root,
        model: path.join(root, 'SmolLM2-360M-Instruct-Q4_K_M.gguf'),
        runtime: path.join(root, 'runtime'),
        marker: path.join(root, 'installation.json'),
    };
}

function updateStatus(nextState: LocalModelState, nextDetail: string): void {
    state = nextState;
    detail = nextDetail;
    if (!statusBar) {
        return;
    }
    const icon: Record<LocalModelState, string> = {
        'not-installed': '$(cloud-download)',
        downloading: '$(sync~spin)',
        ready: '$(check)',
        failed: '$(error)',
        'unsupported-platform': '$(warning)',
    };
    statusBar.text = `${icon[state]} Markdown AI: ${state === 'ready' ? 'Local model ready' : nextDetail}`;
    statusBar.tooltip = `Markdown AI local model: ${nextDetail}`;
    statusBar.show();
}

function assertHttps(url: string): void {
    if (new URL(url).protocol !== 'https:') {
        throw new Error('Local model downloads must use HTTPS.');
    }
}

async function sha256(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const handle = await fs.open(filePath, 'r');
    try {
        const buffer = Buffer.alloc(1024 * 1024);
        let position = 0;
        for (;;) {
            const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
            if (bytesRead === 0) {
                break;
            }
            hash.update(buffer.subarray(0, bytesRead));
            position += bytesRead;
        }
    } finally {
        await handle.close();
    }
    return hash.digest('hex');
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function download(asset: DownloadAsset, destination: string, label: string, signal: AbortSignal): Promise<void> {
    assertHttps(asset.url);
    const partial = `${destination}.download`;
    await fs.mkdir(path.dirname(destination), { recursive: true });
    let offset = (await exists(partial)) ? (await fs.stat(partial)).size : 0;
    const headers = offset > 0 ? { Range: `bytes=${offset}-` } : undefined;
    const timeout = new AbortController();
    const resetTimeout = (): NodeJS.Timeout => setTimeout(() => timeout.abort(new Error('Connection timed out after 30 seconds of inactivity.')), connectionTimeoutMs);
    let timer = resetTimeout();
    const abort = (): void => timeout.abort(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    try {
        const response = await fetch(asset.url, { headers, signal: timeout.signal, redirect: 'follow' });
        if (!response.ok && response.status !== 206) {
            throw new Error(`${label} download returned HTTP ${response.status}.`);
        }
        if (!response.body) {
            throw new Error(`${label} download returned no data.`);
        }
        if (offset > 0 && response.status === 200) {
            await fs.rm(partial, { force: true });
            offset = 0;
        }
        const total = asset.bytes ?? (() => {
            const contentRange = response.headers.get('content-range');
            const match = contentRange?.match(/\/(\d+)$/);
            return match ? Number(match[1]) : offset + Number(response.headers.get('content-length') ?? 0);
        })();
        const stream = (await import('stream')).Readable.fromWeb(response.body as never);
        const output = await fs.open(partial, offset > 0 ? 'a' : 'w');
        const started = Date.now();
        let received = offset;
        try {
            for await (const chunk of stream) {
                clearTimeout(timer);
                timer = resetTimeout();
                if (signal.aborted) {
                    throw signal.reason ?? new Error('Download cancelled.');
                }
                await output.write(chunk);
                received += chunk.length;
                const elapsedSeconds = Math.max((Date.now() - started) / 1000, 0.1);
                const speed = (received - offset) / elapsedSeconds;
                const percent = total ? Math.min(100, Math.floor((received / total) * 100)) : 0;
                const eta = speed > 0 && total ? Math.ceil((total - received) / speed) : 0;
                const etaText = eta ? `, ~${eta}s remaining` : '';
                updateStatus('downloading', `${label}: ${percent}% (${Math.round(received / 1024 / 1024)} MB, ${Math.round(speed / 1024 / 1024)} MB/s${etaText})`);
            }
        } finally {
            await output.close();
        }
    } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
    }
    const actual = await sha256(partial);
    if (actual !== asset.sha256) {
        await fs.rm(partial, { force: true });
        throw new Error(`${label} failed its security checksum verification.`);
    }
    await fs.rm(destination, { force: true });
    await fs.rename(partial, destination);
}

async function findExecutable(directory: string, executableName: string): Promise<string | undefined> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const child = path.join(directory, entry.name);
        if (entry.isFile() && entry.name === executableName) {
            return child;
        }
        if (entry.isDirectory()) {
            const found = await findExecutable(child, executableName);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

async function installRuntime(runtime: RuntimeAsset, paths: ReturnType<typeof storagePaths>, signal: AbortSignal): Promise<string> {
    const archive = path.join(paths.root, `llama-${runtime.version}.${runtime.archive}`);
    if (!(await exists(archive)) || (await sha256(archive)) !== runtime.sha256) {
        await download(runtime, archive, 'Runtime', signal);
    }
    const temporary = `${paths.runtime}.new`;
    await fs.rm(temporary, { recursive: true, force: true });
    await fs.mkdir(temporary, { recursive: true });
    if (runtime.archive === 'zip') {
        const script = `Expand-Archive -LiteralPath '${archive.replace(/'/g, "''")}' -DestinationPath '${temporary.replace(/'/g, "''")}' -Force`;
        await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]);
    } else {
        await execFileAsync('tar', ['-xzf', archive, '-C', temporary]);
    }
    const executable = await findExecutable(temporary, runtime.executableName);
    if (!executable) {
        throw new Error('The downloaded runtime did not contain llama-server.');
    }
    if (process.platform !== 'win32') {
        await fs.chmod(executable, 0o755);
    }
    const relativeExecutable = path.relative(temporary, executable);
    await fs.rm(paths.runtime, { recursive: true, force: true });
    await fs.rename(temporary, paths.runtime);
    return relativeExecutable;
}

async function installedExecutable(context: vscode.ExtensionContext, runtime: RuntimeAsset): Promise<string | undefined> {
    const paths = storagePaths(context);
    try {
        const marker = JSON.parse(await fs.readFile(paths.marker, 'utf8')) as InstallationMarker;
        const executable = path.join(paths.runtime, marker.executable);
        if (marker.modelSha256 === defaultModel.sha256 && marker.runtimeSha256 === runtime.sha256 && await exists(paths.model) && await exists(executable)) {
            return executable;
        }
    } catch {
        // A missing or malformed marker means setup should run again.
    }
    return undefined;
}

async function install(context: vscode.ExtensionContext, runtime: RuntimeAsset): Promise<void> {
    const paths = storagePaths(context);
    const existing = await installedExecutable(context, runtime);
    if (existing) {
        updateStatus('ready', 'Installed and ready to use offline.');
        return;
    }
    downloadController = new AbortController();
    updateStatus('downloading', 'Preparing local setup…');
    try {
        if (!(await exists(paths.model)) || (await sha256(paths.model)) !== defaultModel.sha256) {
            await download(defaultModel, paths.model, 'Writing model', downloadController.signal);
        }
        const executable = await installRuntime(runtime, paths, downloadController.signal);
        const marker: InstallationMarker = { modelSha256: defaultModel.sha256, runtimeSha256: runtime.sha256, executable };
        await fs.writeFile(`${paths.marker}.new`, JSON.stringify(marker), 'utf8');
        await fs.rename(`${paths.marker}.new`, paths.marker);
        updateStatus('ready', 'Installed and ready to use offline.');
    } finally {
        downloadController = undefined;
    }
}

async function waitForServer(baseUrl: string, child: ChildProcess): Promise<void> {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`Local runtime stopped before it was ready (exit code ${child.exitCode}).`);
        }
        try {
            const response = await fetch(`${baseUrl}/models`);
            if (response.ok) {
                return;
            }
        } catch {
            // The server is still starting.
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Local runtime did not become ready within 90 seconds.');
}

export function initializeManagedEngine(context: vscode.ExtensionContext): Promise<void> {
    const runtime = selectRuntime(process.platform, process.arch);
    if (!runtime) {
        updateStatus('unsupported-platform', `Unsupported platform: ${process.platform}-${process.arch}.`);
        return Promise.reject(new Error('This platform is not supported by the managed local model. Configure a custom endpoint instead.'));
    }
    if (!installationPromise) {
        installationPromise = install(context, runtime).catch((error: unknown) => {
            updateStatus('failed', error instanceof Error ? error.message : String(error));
            installationPromise = undefined;
            throw error;
        });
    }
    return installationPromise;
}

export async function startManagedEngine(context: vscode.ExtensionContext): Promise<string> {
    const runtime = selectRuntime(process.platform, process.arch);
    if (!runtime) {
        throw new Error('This platform is not supported by the managed local model. Configure a custom endpoint instead.');
    }
    const installed = await installedExecutable(context, runtime);
    if (!installed && !(await requestSetupApproval(context))) {
        throw new Error('Local model setup was not started. Choose “Set up local model” or configure a custom endpoint.');
    }
    await initializeManagedEngine(context);
    if (!serverPromise) {
        serverPromise = (async () => {
            const executable = await installedExecutable(context, runtime);
            if (!executable) {
                throw new Error('Local model setup is incomplete. Retry the download.');
            }
            const port = 8080;
            const baseUrl = `http://127.0.0.1:${port}/v1`;
            const paths = storagePaths(context);
            server = spawn(executable, ['--model', paths.model, '--host', '127.0.0.1', '--port', String(port), '--ctx-size', '4096'], { windowsHide: true });
            server.on('error', (error: Error) => console.error('Markdown AI local runtime error:', error.message));
            await waitForServer(baseUrl, server);
            return baseUrl;
        })().catch((error: unknown) => {
            serverPromise = undefined;
            throw error;
        });
    }
    return serverPromise;
}

export function registerManagedEngine(context: vscode.ExtensionContext): void {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'markdownAi.showLocalModelStatus';
    context.subscriptions.push(statusBar);
    const runtime = selectRuntime(process.platform, process.arch);
    updateStatus(runtime ? 'not-installed' : 'unsupported-platform', runtime ? 'Setup required' : `Unsupported platform: ${process.platform}-${process.arch}.`);
    if (vscode.workspace.getConfiguration('markdownAi').get<boolean>('useManagedEngine', true) && runtime) {
        void requestSetupApproval(context).then((approved) => {
            if (approved) {
                void initializeManagedEngine(context);
            }
        });
    }
}

export async function showManagedEngineStatus(context: vscode.ExtensionContext): Promise<void> {
    if (state === 'ready') {
        vscode.window.showInformationMessage(`Markdown AI local model: ${detail}`);
        return;
    }
    if (state === 'downloading') {
        const choice = await vscode.window.showInformationMessage(`Markdown AI local setup: ${detail}`, 'Cancel download', 'Open settings');
        if (choice === 'Cancel download') {
            downloadController?.abort(new Error('Download cancelled.'));
        } else if (choice === 'Open settings') {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'markdownAi.useManagedEngine');
        }
        return;
    }
    const choice = await vscode.window.showWarningMessage(`Markdown AI local setup: ${detail}`, 'Retry download', 'Use custom endpoint', 'Open troubleshooting');
    if (choice === 'Retry download') {
        void initializeManagedEngine(context);
    } else if (choice === 'Use custom endpoint') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'markdownAi.useManagedEngine');
    } else if (choice === 'Open troubleshooting') {
        await vscode.env.openExternal(vscode.Uri.parse('https://amarpreetbhatia.github.io/markdown-ai-editor-/troubleshooting/'));
    }
}

export function stopManagedEngine(): void {
    downloadController?.abort(new Error('Extension deactivated.'));
    if (server && server.exitCode === null) {
        server.kill();
    }
    server = undefined;
    serverPromise = undefined;
}
