# Markdown AI workflow commands and local-model page

## Goal

Make Markdown AI Editor more useful as a writing and documentation tool while keeping edits local, reversible, and understandable to non-developers.

## User experience

The existing Grammar command remains unchanged. Add three commands to the Markdown AI context-menu group:

- **Structure as Clean Markdown**: reorganize rough content into readable, Markdown-compliant headings, lists, emphasis, spacing, and hierarchy without inventing facts.
- **Make a Skill**: turn selected content into a standalone `SKILL.md` with YAML frontmatter (`name` and `description`) and a reusable workflow, based on the VS Code skill format.
- **Create PRD**: turn selected content into a practical product-requirements document with problem, goals, non-goals, users, requirements, stories, acceptance criteria, risks, and open questions.

Each command uses the selected range. If the selection is empty, show a confirmation choice: **Transform entire document** or **Cancel**. The entire-document path uses one editor edit so Ctrl/Cmd+Z restores the previous document.

Add keyboard chords active for Markdown and plaintext editors:

- Windows/Linux: `Ctrl+M F`, `Ctrl+M C`, `Ctrl+M S`, `Ctrl+M P`.
- macOS: `Cmd+M F`, `Cmd+M C`, `Cmd+M S`, `Cmd+M P`.

## Local Model tab

When the managed model is ready, clicking the status bar opens a VS Code webview tab. The tab displays the active local API URL and port, the lightweight SmolLM2 model name, offline/local-processing explanation, and links to the hosted user guide and managed-model documentation. It must not include document text or secrets. The existing status command continues to provide setup/retry/cancel actions.

## Architecture

Refactor the extension command flow around a shared transformation helper that owns target-range selection, full-document confirmation, progress/cancellation, API calls, empty-response handling, and a single edit application. Each command supplies only its system prompt and title.

Add a managed-engine function that reports the active base URL and opens the webview. The webview uses a message-safe static HTML template; links open externally through VS Code's URI handler. The managed engine remains the only owner of the local port and process lifecycle.

## Prompt constraints

Prompts must instruct the model to return only the transformed Markdown, preserve source facts, avoid commentary, and mark missing information as assumptions/open questions rather than fabricate it. The Skill prompt must require valid frontmatter and reusable steps; the PRD prompt must require the defined sections.

## Failure behavior

The existing progress cancellation and API error notifications apply to every command. If no active editor or the file language is outside Markdown/plaintext, show the existing friendly warning. If the user cancels the empty-selection confirmation, do not call the model or change the document.

## Verification

- Manifest tests cover all commands, context-menu grouping, and platform keyboard chords.
- Unit/static tests cover prompt labels, empty-selection confirmation, and webview content including port and documentation links.
- Existing typecheck, test, package, and MkDocs builds remain green.
- Manually verify each command with a selection, full-document confirmation, undo, shortcut invocation on Windows, and equivalent Command chords on macOS.
