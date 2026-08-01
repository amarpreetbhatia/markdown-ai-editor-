export interface DownloadAsset {
    url: string;
    sha256: string;
    bytes?: number;
}

export interface RuntimeAsset extends DownloadAsset {
    version: string;
    archive: 'zip' | 'tar.gz';
    executableName: string;
}

export const defaultModel: DownloadAsset & { displayName: string; version: string } = {
    displayName: 'SmolLM2-360M-Instruct-Q4_K_M',
    version: '2024-11-18',
    url: 'https://huggingface.co/mradermacher/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct.Q4_K_M.gguf',
    sha256: 'ade7aee1e5bd7c3b8f1fedafc61a1a0be31e8afa64e006607cd202323e2ccce0',
    bytes: 270_590_976,
};

const runtimes: Record<string, RuntimeAsset> = {
    'win32-x64': {
        version: 'b9637',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b9637/llama-b9637-bin-win-cpu-x64.zip',
        sha256: 'f7783c2b8c007f95e710ac40f26a24861a80b603b0b739fc54d7c926a4716c1e',
        archive: 'zip',
        executableName: 'llama-server.exe',
    },
    'darwin-x64': {
        version: 'b9637',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b9637/llama-b9637-bin-macos-x64.tar.gz',
        sha256: '71743f8db0958e7c266cceb7add7b16aa418a964667e471094aa6ae65b9c8298',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
    'darwin-arm64': {
        version: 'b9637',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b9637/llama-b9637-bin-macos-arm64.tar.gz',
        sha256: '72a93f3e68c31de3e438d462669aad1fcdb423b995e9c41033cc7d27a9a3ac69',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
    'linux-x64': {
        version: 'b9637',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b9637/llama-b9637-bin-ubuntu-x64.tar.gz',
        sha256: 'a50ee14f021a9d8e92e30f622f7e3be1318ee1125bb9a9ba8d2025388df48743',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
};

export function selectRuntime(platform: string, architecture: string): RuntimeAsset | undefined {
    return runtimes[`${platform}-${architecture}`];
}
