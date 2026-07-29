# Markdown AI Editor

Private Markdown and plain-text editing in VS Code. Markdown AI uses a local Llama 3.2 1B model for grammar cleanup and note formatting, so managed mode does not send selected text to Copilot or other cloud services.

Select text in a Markdown or plain-text document, then run **Markdown AI: Fix Grammar & Refine** or **Markdown AI: Convert to Clean Markdown**. On first use, managed mode asks permission to download the executable local model (about 1.12 GB), binds it to `127.0.0.1`, and stops it when the extension deactivates. You can instead disable managed mode and configure an OpenAI-compatible endpoint.

Managed mode needs roughly 1.2 GB of disk space and at least 4 GB of RAM. Review all generated edits; the model does not verify factual accuracy. See `markdownAi.*` settings in VS Code for configuration and the included marketplace checklist before a release.

## Features

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
