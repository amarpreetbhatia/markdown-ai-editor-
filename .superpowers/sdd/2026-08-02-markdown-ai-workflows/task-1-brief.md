# Task 1 brief — Add command metadata and keyboard chords

Read this file as the complete requirements for Task 1.

Modify `package.json` and `test/manifest.test.mjs` only. Add command IDs:

- `markdownAi.structureMarkdown` titled `Markdown AI: Structure as Clean Markdown`
- `markdownAi.makeSkill` titled `Markdown AI: Make a Skill`
- `markdownAi.createPrd` titled `Markdown AI: Create PRD`

Add each to the existing `editor/context` Markdown AI group with when clauses limited to `editorHasSelection && (resourceLangId == markdown || resourceLangId == plaintext)` (the existing commands may retain their current conditions). Add keybindings active for Markdown/plaintext editors:

- Windows/Linux: `ctrl+m f`, `ctrl+m c`, `ctrl+m s`, `ctrl+m p` for grammar, clean Markdown, skill, and PRD respectively.
- macOS: `cmd+m f`, `cmd+m c`, `cmd+m s`, `cmd+m p` for the same command IDs.

Update manifest tests to assert titles, command IDs, Markdown AI context grouping, and all eight platform shortcut entries. Run `npm.cmd test`; do not modify source behavior in this task. Commit with an imperative message. Write the report to `.superpowers/sdd/2026-08-02-markdown-ai-workflows/task-1-report.md` containing changed files, commit, test command/output, and concerns; return only status, commit, one-line test summary, and concerns.
