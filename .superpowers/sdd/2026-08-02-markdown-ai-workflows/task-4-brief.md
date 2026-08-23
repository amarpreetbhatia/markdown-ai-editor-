# Task 4 brief — Add Local Model webview

Read this file as the complete requirements for Task 4. Base commit is 66519a0.

Modify `src/managedEngine.ts`, `src/extension.ts`, and create `test/local-model-page.test.mjs`. Add an exported or testable `localModelPageHtml(baseUrl: string, modelName: string): string` that produces static HTML for the Local Model tab. It must include the active URL `http://127.0.0.1:8080/v1`, port `8080`, model name `SmolLM2-360M-Instruct-Q4_K_M`, clear lightweight/local/offline wording, and links to `https://amarpreetbhatia.github.io/markdown-ai-editor-/` and `/local-model/`. Escape interpolated values so the page cannot inject HTML. Do not include document text or secrets.

Add `showLocalModelPage(): void` (or equivalent context-aware function) that opens a VS Code webview panel. Register `markdownAi.openLocalModelPage` in `package.json` if needed, and make the ready status-bar item open this page while retaining the existing status command setup/retry/cancel behavior. Use VS Code-safe link handling: external links must be routed through `vscode.env.openExternal`, not arbitrary webview navigation. Keep port/model values sourced from the managed engine constants, not user document content.

Write failing source/HTML tests first, run them, implement the page, then run `npm.cmd test` and `npm.cmd run typecheck`, commit, and write `.superpowers/sdd/2026-08-02-markdown-ai-workflows/task-4-report.md`. Return only status, commit, one-line test summary, and concerns.
