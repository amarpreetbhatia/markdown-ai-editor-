# Markdown AI Editor user guide

Markdown AI Editor improves selected Markdown and plain text directly in Visual Studio Code. It offers two commands:

- **Fix Grammar & Refine** corrects spelling and grammar while preserving the meaning and Markdown.
- **Convert to Clean Markdown** turns rough notes into a structured Markdown draft.

## Before you begin

You need Visual Studio Code, this extension, and a Markdown (`.md`) or plain-text document. Managed mode is enabled by default. It downloads a local Llama 3.2 1B model once, needs about 1.2 GB of disk space and at least 4 GB of RAM, and runs only on your computer.

## First successful edit

1. Open or create a Markdown or plain-text file.
2. Highlight a short paragraph to start.
3. Right-click the selection and choose one of the **Markdown AI** commands. Alternatively, open the Command Palette with ++ctrl+shift+p++ and search for `Markdown AI`.
4. If this is your first managed-mode request, read the consent dialog and select **Download model**.
5. Wait for the download and local model startup. Then review the replacement in your editor.

!!! tip "Start small"
    Try one or two sentences first. The generated replacement is an edit to your document, so use ++ctrl+z++ if you do not want to keep it.

Continue with [First run](first-run.md) for details about the download, or go directly to [Use the commands](commands.md).
