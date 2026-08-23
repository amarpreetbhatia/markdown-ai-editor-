# Markdown AI Editor user guide

Markdown AI Editor improves selected Markdown and plain text directly in Visual Studio Code. It runs its managed writing model on your computer and applies the result only after you choose a command.

- **Fix Grammar & Refine** corrects spelling and grammar while preserving the meaning and Markdown.
- **Convert to Clean Markdown** turns rough notes into a structured Markdown draft.
- **Convert to AI Skill Format**, **Convert to AI Prompt Format**, and **Convert to PRD** turn rough ideas into reusable agent-ready documents.

## Demo

[Watch the VS Code extension demo](https://github.com/amarpreetbhatia/markdown-ai-editor-/blob/main/vs-code-ext-demo.mp4)

## Prerequisites

You need VS Code 1.85 or later, this extension, and a Markdown (`.md`) or plain-text document. Managed mode is enabled by default. After you approve it, it downloads the `Qwen3-0.6B-Q8_0` writing model (about 640 MB) and a native local runtime. Allow roughly 1 GB of disk space and 2 GB of available RAM. Managed mode supports Windows x64, macOS Intel, macOS Apple Silicon, and Linux x64. It runs only on your computer and works offline after setup.

## Work efficiently with coding agents

Use Markdown AI Editor before pasting notes into Copilot, Codex, Claude Code, or another coding agent. Local cleanup can remove duplicated prose and turn loose ideas into a compact Markdown structure, reducing repeated prompt context in those workflows. This can reduce prompt tokens; it cannot change another product's tokenizer, billing, model behavior, or privacy policy. Review all material before sending it to an external service.

## First successful edit

1. Open or create a Markdown or plain-text file.
2. Highlight a short paragraph to start.
3. Right-click the selection and open **Markdown AI Editor**, then choose a command. Alternatively, open the Command Palette with ++ctrl+shift+p++ and search for `Markdown AI`.
4. If this is your first managed-mode request, read the consent dialog and select **Set up local model**.
5. Wait for the download and local model startup. Then review the replacement in your editor.

!!! tip "Start small"
    Try one or two sentences first. The generated replacement is an edit to your document, so use ++ctrl+z++ if you do not want to keep it.

Continue with [First run](first-run.md) for details about the download, or go directly to [Use the commands](commands.md).
