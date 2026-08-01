# Managed local model

Managed mode is the simplest way to use Markdown AI Editor. The model is **not** included inside the VSIX extension package. Instead, after you explicitly approve setup, the extension downloads a small writing model and the program that runs it on your computer.

This keeps the Marketplace download small and lets the extension install the correct native runtime for your computer.

## What is installed

The managed setup has two parts:

| Part | Purpose |
| --- | --- |
| `SmolLM2-360M-Instruct-Q4_K_M` model | The local English writing assistant. It is about 271 MB. |
| `llama-server` runtime | The native program that loads the model and provides a local OpenAI-compatible API. |

The extension selects a pinned runtime for Windows x64, macOS Intel, macOS Apple Silicon, or Linux x64. On an M-series Mac, it downloads the native Apple Silicon runtime; Rosetta is not required.

Both files are downloaded over HTTPS and verified with a built-in SHA-256 checksum before use. The runtime listens only on `127.0.0.1`, so other devices cannot connect to it by default.

## First-time setup

1. Open a Markdown or plain-text file. This activates the extension.
2. Read the **Set up local model** prompt. It states that the first setup uses the internet and that future editing can work offline.
3. Select **Set up local model**.
4. Continue editing while the status bar shows download progress, including percent, downloaded size, speed, and estimated remaining time.
5. When the status bar shows **Local model ready**, select text and run either Markdown AI command.

Allow about 1 GB of free disk space and 2 GB of available RAM. Initial startup can take up to 90 seconds on a busy machine.

## What happens when you run a command

1. The extension starts `llama-server` if it is not already running.
2. The server loads the local model and opens a private API on `127.0.0.1:8080`.
3. The extension sends the selected text and its editing instruction to that local API.
4. The server returns revised text; the extension replaces the selection.
5. When VS Code deactivates the extension, it stops the local server.

The model does not need an internet connection after installation. Review every edit: it can make wording, Markdown, or factual mistakes.

## Status, cancellation, and retry

Run **Markdown AI: Show Local Model Status** from the Command Palette at any time.

- During setup, choose **Cancel download** to stop it. A partial download is retained so the next setup can resume.
- If a download or integrity check fails, choose **Retry download**.
- On an unsupported platform, choose **Use custom endpoint** and follow [Use Ollama locally](ollama.md) or connect another OpenAI-compatible server.

## Offline use and updates

After a successful setup, opening VS Code again uses the files already installed; it does not need to download the model or runtime again. A future extension release may intentionally pin a newer model or runtime. In that case, the extension will ask for setup again and verify the new files before switching to them.

See [Privacy and limitations](privacy.md) for the difference between managed mode and a custom endpoint.
