# Task 2 brief — Extract shared transformation flow

Read this file as the complete requirements for Task 2.

Modify `src/extension.ts` and create `test/extension-prompts.test.mjs` only. Keep the current custom endpoint behavior and managed engine call intact. Refactor the command request path into a shared helper with this behavior:

- Selected text is used immediately.
- An empty selection asks `vscode.window.showWarningMessage` with the actions **Transform entire document** and **Cancel**. Cancel must return before calling `fetch` or editing.
- Transforming the whole document uses a single `editor.edit` replacement so Ctrl/Cmd+Z restores the prior document.
- Preserve current progress notification, cancellation AbortController, API URL resolution, empty-response error, and friendly error messages.

The public shape expected by later tasks is `processSelectedText(context, title, systemPrompt): Promise<void>` and a target helper equivalent to `getTargetText(editor): Promise<{ text: string; range: vscode.Range } | undefined>`. Keep helpers testable through source inspection or exports compatible with the existing test setup. Do not add transformation-specific prompts yet; existing Grammar and Clean Markdown commands should route through the shared helper with their existing behavior. Add focused tests for the prompt catalog placeholder or helper behavior as appropriate, but do not require VS Code runtime mocks that the repository does not have. Run `npm.cmd test` and `npm.cmd run typecheck`, commit, and write `.superpowers/sdd/2026-08-02-markdown-ai-workflows/task-2-report.md` with changed files, commit, test output, and concerns. Return only status, commit, one-line test summary, and concerns.
