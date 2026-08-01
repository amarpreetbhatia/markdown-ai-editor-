# Marketplace Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the first Marketplace release as `AmarpreetBhatia.markdown-ai-editor`.

**Architecture:** The release remains a bundled Node-based VS Code extension. `package.json` supplies Marketplace identity and resource metadata, while `vsce` runs the existing prepublish bundle and creates the VSIX used for publication.

**Tech Stack:** TypeScript, esbuild, Node test runner, `@vscode/vsce`.

## Global Constraints

- Preserve the user-owned modification in `src/extension.ts`.
- Use publisher ID `AmarpreetBhatia`.
- Do not write credentials or personal access tokens into repository files.

---

### Task 1: Release Manifest

**Files:**
- Modify: `package.json`
- Test: `test/manifest.test.mjs`

**Interfaces:**
- Consumes: Visual Studio Marketplace manifest fields.
- Produces: the Marketplace extension identity `AmarpreetBhatia.markdown-ai-editor`.

- [ ] **Step 1: Write the failing test**

Add assertions that `packageJson.publisher` is `AmarpreetBhatia`, `packageJson.license` is `MIT`, `packageJson.pricing` is `Free`, and the repository, bugs, and homepage point to `amarpreetbhatia/markdown-ai-editor-`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/manifest.test.mjs`
Expected: FAIL because the manifest currently uses `local-dev` and omits the release fields.

- [ ] **Step 3: Write minimal implementation**

Set `publisher` to `AmarpreetBhatia` and add only the Marketplace metadata asserted by the test.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/manifest.test.mjs`
Expected: PASS.

### Task 2: Package and Publish

**Files:**
- Create: `markdown-ai-editor-0.0.1.vsix`

**Interfaces:**
- Consumes: the manifest from Task 1 and the bundled `dist/extension.js`.
- Produces: the Marketplace package and publication.

- [ ] **Step 1: Build and validate**

Run: `npm.cmd run typecheck`, `npm.cmd run package`, and `npm.cmd exec --yes --package @vscode/vsce vsce package --no-dependencies`.

- [ ] **Step 2: Inspect package metadata**

Run: `npm.cmd exec --yes --package @vscode/vsce vsce ls --no-dependencies` and inspect the VSIX manifest for the required identity and entry point.

- [ ] **Step 3: Publish**

Run: `npm.cmd exec --yes --package @vscode/vsce vsce publish --packagePath markdown-ai-editor-0.0.1.vsix`.

- [ ] **Step 4: Verify published listing**

Confirm that `AmarpreetBhatia.markdown-ai-editor` is available in the Visual Studio Marketplace.
