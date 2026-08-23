# Markdown AI Editor

Refine Markdown and plain text in VS Code with a local AI model. In managed mode, the extension downloads and runs the model on your computer; selected text is not sent to Copilot or another cloud service.

## Version 0.0.3

This release adds a focused **Markdown AI Editor** context submenu, keyboard shortcuts for every transformation, AI Skill, AI Prompt, and PRD formats, plus a status-bar port indicator while the local model is running. Managed mode now uses the pinned `Qwen3-0.6B-Q8_0` model: a modern instruction-following model that keeps the managed download near 640 MB while improving structured Markdown generation.

## Prerequisites

- VS Code 1.85 or later.
- Windows x64, macOS Intel, macOS Apple Silicon, or Linux x64 for managed mode.
- About 1 GB of free disk space, 2 GB of available RAM, and internet access only for the approved first-time download.
- A Markdown or plain-text file. Custom endpoints require an OpenAI-compatible local or remote service.

## Quick start

1. Open a `.md` or plain-text file in VS Code.
2. Select the text you want to improve.
3. Right-click the selection and choose **Markdown AI: Fix Grammar & Refine** or **Markdown AI: Convert to Clean Markdown**. You can also run either command from the Command Palette (`Ctrl+Shift+P`).
4. On first use, choose **Set up local model** when prompted. The Qwen3 0.6B writing model is about 640 MB; the native runtime is downloaded separately and runs only on `127.0.0.1`.
5. Review the replacement. Use `Ctrl+Z` to undo it if needed.

Managed mode needs internet only for its consented first-time setup. Allow roughly 1 GB of free disk space and 2 GB of available RAM. It can take up to 90 seconds to start after the download. Windows x64, macOS Intel, macOS Apple Silicon, and Linux x64 are supported. You may instead disable managed mode and provide an OpenAI-compatible local endpoint.

## Use alongside coding agents

Markdown AI Editor prepares notes, requirements, prompts, and PRDs locally before you send them to Copilot, Codex, Claude Code, or another agent. Cleaner, shorter source material can reduce repeated context and prompt tokens in those external workflows. It does not change an agent's tokenizer, model pricing, or private data policy; review what you send to every external service.

## User guide

Follow the complete guide at [amarpreetbhatia.github.io/markdown-ai-editor-](https://amarpreetbhatia.github.io/markdown-ai-editor-/). It covers first-run setup, commands, settings, privacy, and troubleshooting.

It also explains the [managed local model](docs/local-model.md) and includes a [local Ollama setup example](docs/ollama.md).

## Local Testing & Development

Install dependencies, run the checks, create a production bundle, package a VSIX, and install it into your local VS Code instance:

```bash
npm install
npm test
npm run typecheck
npm run package
npm exec --yes --package @vscode/vsce -- vsce package --no-dependencies
code --install-extension markdown-ai-editor-*.vsix
```

The VSIX filename includes the extension version, for example `markdown-ai-editor-0.0.3.vsix`. You can also use VS Code's **Extensions: Install from VSIX...** command. For iterative development, run `npm run compile` and launch the **Run Extension** configuration (`F5`).

See [Repository Guidelines](AGENTS.md) for contributor conventions.

## License

[MIT](LICENSE)
