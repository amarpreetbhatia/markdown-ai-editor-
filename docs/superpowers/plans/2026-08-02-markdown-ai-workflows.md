# Markdown AI workflow commands and local-model page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe Markdown transformations, keyboard chords, and a local-model information tab while preserving the existing local/custom endpoint architecture.

**Architecture:** Extract shared selection confirmation, request progress, and edit application from `src/extension.ts`. Register four transformation commands with command metadata and platform-specific chords. Add a webview opener in `src/managedEngine.ts` that displays the runtime URL/port and documentation links without exposing document content.

**Tech Stack:** TypeScript, VS Code Extension API, Node test runner, esbuild, MkDocs.

## Global Constraints

- Selected text transforms immediately; an empty selection requires explicit **Transform entire document** confirmation or cancellation.
- Commands return only transformed Markdown, preserve source facts, and label missing information instead of inventing it.
- Managed runtime remains local on `127.0.0.1`; webview shows port/model only and no document text.
- Windows/Linux use `Ctrl+M` chords; macOS uses equivalent `Cmd+M` chords.
- Existing custom endpoint behavior and managed setup state machine remain unchanged.

---

### Task 1: Add command metadata and keyboard chords

**Files:**
- Modify: `package.json`
- Test: `test/manifest.test.mjs`

**Interfaces:**
- Produces command IDs `markdownAi.structureMarkdown`, `markdownAi.makeSkill`, and `markdownAi.createPrd`.

- [ ] **Step 1: Write failing manifest assertions** for four command titles, the `Markdown AI` context-menu group, and `keybindings` entries with `ctrl+m f/c/s/p` and `cmd+m f/c/s/p`.
- [ ] **Step 2: Run `npm.cmd test`** and verify the new assertions fail because metadata is absent.
- [ ] **Step 3: Add the three commands, context-menu entries, and platform-specific keybindings** with `editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)` conditions.
- [ ] **Step 4: Run `npm.cmd test`** and verify the manifest assertions pass.

### Task 2: Extract shared transformation flow

**Files:**
- Modify: `src/extension.ts`
- Test: `test/extension-prompts.test.mjs` (create)

**Interfaces:**
- Produces `processSelectedText(context, title, systemPrompt): Promise<void>` and `getTargetText(editor): Promise<{ text: string; range: vscode.Range } | undefined>`.

- [ ] **Step 1: Add tests** asserting a prompt catalog contains Grammar, Clean Markdown, Skill, and PRD instructions and that each says to return only transformed Markdown.
- [ ] **Step 2: Run the focused test** and verify it fails before the catalog exists.
- [ ] **Step 3: Implement a shared `getTargetText`** that returns the current selection immediately, or asks `vscode.window.showWarningMessage` with **Transform entire document** and **Cancel** when empty; cancellation returns `undefined` without calling fetch.
- [ ] **Step 4: Route all four commands through the shared helper**, preserving the existing progress cancellation, API request, empty-response error, and single `editor.edit` replacement.
- [ ] **Step 5: Run typecheck and focused tests** and verify all pass.

### Task 3: Implement transformation prompts

**Files:**
- Modify: `src/extension.ts`
- Modify: `docs/commands.md`
- Test: `test/extension-prompts.test.mjs`

**Interfaces:**
- Prompt strings are exported as `TRANSFORMATION_PROMPTS` for test inspection and command registration.

- [ ] **Step 1: Add failing prompt-content assertions** for Markdown structure rules, Skill frontmatter/workflow rules, and PRD required sections.
- [ ] **Step 2: Implement prompts** with explicit fact preservation, no commentary, no fabricated details, and output-only Markdown.
- [ ] **Step 3: Register `structureMarkdown`, `makeSkill`, and `createPrd` commands** with user-facing titles matching `package.json`.
- [ ] **Step 4: Update the command guide** with examples, selection behavior, undo, and outputs.
- [ ] **Step 5: Run `npm.cmd test` and `npm.cmd run typecheck`**.

### Task 4: Add Local Model webview

**Files:**
- Modify: `src/managedEngine.ts`
- Modify: `src/extension.ts`
- Test: `test/local-model-page.test.mjs` (create)

**Interfaces:**
- Produces `showLocalModelPage(): void` and `localModelPageHtml(baseUrl: string, modelName: string): string`.

- [ ] **Step 1: Add failing tests** requiring the generated HTML to include `http://127.0.0.1:8080/v1`, port `8080`, `SmolLM2-360M-Instruct-Q4_K_M`, offline wording, and links to `/local-model/` and `/` documentation.
- [ ] **Step 2: Implement the static HTML template** with escaped interpolated values, no document text, and external links opened through `vscode.env.openExternal`.
- [ ] **Step 3: Register the webview command and make the ready status-bar item open it**, while retaining the existing status dialog action for setup states.
- [ ] **Step 4: Run the focused test and typecheck**.

### Task 5: Documentation and release verification

**Files:**
- Modify: `README.md`, `docs/local-model.md`, `docs/first-run.md`, `docs/settings.md`, `docs/privacy.md`, `docs/troubleshooting.md`, `mkdocs.yml`

- [ ] **Step 1: Document the four commands, shortcuts, selection confirmation, local-model tab, and Ollama alternative.**
- [ ] **Step 2: Run `npm.cmd test`, `npm.cmd run typecheck`, and `mkdocs build --strict`.**
- [ ] **Step 3: Run `npm.cmd run package` and verify the VSIX listing contains no model/runtime binaries.**
- [ ] **Step 4: Manually verify Windows shortcuts, selection/full-document confirmation, undo, status-tab port display, and custom endpoint mode.**
