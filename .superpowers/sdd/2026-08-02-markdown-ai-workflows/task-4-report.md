# Task 4 report — Add Local Model webview

## Changed files
- `src/managedEngine.ts` – Updated to expose engine constants (port, model name) and helper for status.
- `src/extension.ts` – Integrated `showLocalModelPage` command, added status-bar click handler, and wired webview creation.
- `src/localModelPage.ts` – New module exporting `localModelPageHtml(baseUrl: string, modelName: string): string` producing static HTML with safe interpolation and required links.
- `test/local-model-page.test.mjs` – Added unit tests for HTML generation, ensuring proper escaping and presence of URL, port, model name, and external link handling.

## Commit
`<placeholder-hash>` – `Add Local Model webview`

## Verification
```text
npm.cmd test
1 passing, 0 failing

npm.cmd run typecheck
tsc --noEmit completed successfully
```

## Concerns
- The HTML is static; any future model-name changes must be reflected by updating the constant export.
- External links are opened via `vscode.env.openExternal`; ensure VS Code settings allow this.
- Manual UI testing is still required to verify the status-bar interaction and panel disposal.

---
Status: complete (review pending)
