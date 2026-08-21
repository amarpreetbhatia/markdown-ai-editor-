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
    displayName: 'Qwen3-0.6B-Q8_0',
    version: '2025-05-08',
    url: 'https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q8_0.gguf',
    sha256: '9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031',
    bytes: 639_446_688,
};

const runtimes: Record<string, RuntimeAsset> = {
    'win32-x64': {
        version: 'b10549',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b10549/llama-b10549-bin-win-cpu-x64.zip',
        sha256: '11d38f2ed878489b2c3d02b3d1a67683c02fbfb3d265876b9ede749a8dff5f1c',
        archive: 'zip',
        executableName: 'llama-server.exe',
    },
    'darwin-x64': {
        version: 'b10549',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b10549/llama-b10549-bin-macos-x64.tar.gz',
        sha256: '94177680843a187881ae54021bbad8211c40797cab0df923ef17ee735e3ade09',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
    'darwin-arm64': {
        version: 'b10549',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b10549/llama-b10549-bin-macos-arm64.tar.gz',
        sha256: '71e4b31afb020d6b71894eb8d1f2c0693038aec3f41f672f9fafb5055c8f2226',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
    'linux-x64': {
        version: 'b10549',
        url: 'https://github.com/ggml-org/llama.cpp/releases/download/b10549/llama-b10549-bin-ubuntu-x64.tar.gz',
        sha256: '66b26d8cb3ab8edaf5a12bfe642b8f00844925f614f196a96a222b7ed1582c1d',
        archive: 'tar.gz',
        executableName: 'llama-server',
    },
};

export function selectRuntime(platform: string, architecture: string): RuntimeAsset | undefined {
    return runtimes[`${platform}-${architecture}`];
}
