# Markdown AI Editor

Refine Markdown and plain text in VS Code with a local Llama 3.2 1B model. In managed mode, the extension downloads and runs the model on your computer; selected text is not sent to Copilot or another cloud service.

## Quick start

1. Open a `.md` or plain-text file in VS Code.
2. Select the text you want to improve.
3. Right-click the selection and choose **Markdown AI: Fix Grammar & Refine** or **Markdown AI: Convert to Clean Markdown**. You can also run either command from the Command Palette (`Ctrl+Shift+P`).
4. On first use, choose **Download model** when prompted. The managed model is about 1.12 GB and runs on `127.0.0.1`.
5. Review the replacement. Use `Ctrl+Z` to undo it if needed.

Managed mode needs roughly 1.2 GB of disk space and at least 4 GB of RAM. It can take up to 90 seconds to start after the download. You may instead disable managed mode and provide an OpenAI-compatible local endpoint.

## User guide

Follow the complete guide at [amarpreetbhatia.github.io/markdown-ai-editor-](https://amarpreetbhatia.github.io/markdown-ai-editor-/). It covers first-run setup, commands, settings, privacy, and troubleshooting.

## Development

- `npm.cmd run compile` bundles the extension for development.
- `npm.cmd test` runs manifest and documentation checks.
- `npm.cmd run typecheck` checks TypeScript without writing output.

See [Repository Guidelines](AGENTS.md) for contributor conventions.

## License

[MIT](LICENSE)
