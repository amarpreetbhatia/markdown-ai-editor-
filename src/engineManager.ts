import * as vscode from 'vscode';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

let llamaProcess: ChildProcess | undefined;
let activePort: number | undefined;

/**
 * Finds an open dynamic TCP port on localhost to avoid collisions.
 */
function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

/**
 * Returns platform-specific executable filename.
 */
function getBinaryName(): string {
  return process.platform === 'win32' ? 'llamafile.exe' : 'llamafile';
}

/**
 * Ensures local AI binary exists in global extension storage. Downloads if missing.
 */
async function ensureBinaryExists(context: vscode.ExtensionContext): Promise<string> {
  const storagePath = context.globalStorageUri.fsPath;
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const binaryName = getBinaryName();
  const binaryPath = path.join(storagePath, binaryName);

  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }

  // Replace this URL with your hosted executable/llamafile download link
  const downloadUrl = `https://github.com/Mozilla-Ocho/llamafile/releases/download/0.8.13/llamafile-0.8.13`;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Markdown AI: Downloading engine binary (first run only)...',
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: 'Fetching file...' });
      const response = await fetch(downloadUrl);
      if (!response.ok || !response.body) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const fileStream = fs.createWriteStream(binaryPath);
      await pipeline(Readable.fromWeb(response.body as any), fileStream);

      // Grant execution permissions on macOS/Linux
      if (process.platform !== 'win32') {
        fs.chmodSync(binaryPath, 0o755);
      }
    }
  );

  return binaryPath;
}

/**
 * Starts the local AI process on a dynamic free port and returns the base API URL.
 */
export async function startManagedEngine(context: vscode.ExtensionContext): Promise<string> {
  if (llamaProcess && activePort) {
    return `http://127.0.0.1:${activePort}/v1`;
  }

  const binaryPath = await ensureBinaryExists(context);
  activePort = await getFreePort();

  llamaProcess = spawn(binaryPath, [
    '--server',
    '--nobrowser',
    '--port', activePort.toString(),
    '--ctx-size', '2048'
  ]);

  llamaProcess.stderr?.on('data', (data) => {
    console.log(`[Managed Engine]: ${data}`);
  });

  return `http://127.0.0.1:${activePort}/v1`;
}

/**
 * Terminates the managed background engine.
 */
export function stopManagedEngine(): void {
  if (llamaProcess) {
    llamaProcess.kill('SIGTERM');
    llamaProcess = undefined;
    activePort = undefined;
  }
}
