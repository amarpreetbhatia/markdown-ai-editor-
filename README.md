# Markdown AI Editor

Refine Markdown and plain text in VS Code with a local AI model. In managed mode, the extension downloads and runs the model on your computer; selected text is not sent to Copilot or another cloud service.

## Quick start

1. Open a `.md` or plain-text file in VS Code.
2. Select the text you want to improve.
3. Right-click the selection and choose **Markdown AI: Fix Grammar & Refine** or **Markdown AI: Convert to Clean Markdown**. You can also run either command from the Command Palette (`Ctrl+Shift+P`).
4. On first use, choose **Set up local model** when prompted. The writing model is about 271 MB; the native runtime is downloaded separately and runs only on `127.0.0.1`.
5. Review the replacement. Use `Ctrl+Z` to undo it if needed.

Managed mode needs internet only for its consented first-time setup. Allow roughly 1 GB of free disk space and 2 GB of available RAM. It can take up to 90 seconds to start after the download. Windows x64, macOS Intel, macOS Apple Silicon, and Linux x64 are supported. You may instead disable managed mode and provide an OpenAI-compatible local endpoint.

## User guide

Follow the complete guide at [amarpreetbhatia.github.io/markdown-ai-editor-](https://amarpreetbhatia.github.io/markdown-ai-editor-/). It covers first-run setup, commands, settings, privacy, and troubleshooting.

It also explains the [managed local model](docs/local-model.md) and includes a [local Ollama setup example](docs/ollama.md).

## Development

- `npm.cmd run compile` bundles the extension for development.
- `npm.cmd test` runs manifest and documentation checks.
- `npm.cmd run typecheck` checks TypeScript without writing output.


 ## Generate Manual
  `npm install`
   `npm test`
  `npm run typecheck`
  `npm run package`
  `npm.cmd exec --yes --package @vscode/vsce -- vsce package --no-dependencies`

  This creates:

  markdown-ai-editor-0.0.2.vsix

  Install it locally:

  code.cmd --install-extension .\markdown-ai-editor-0.0.2.vsix

  Or in VS Code: Extensions → ... → Install from VSIX...


See [Repository Guidelines](AGENTS.md) for contributor conventions.

## License

[MIT](LICENSE)
