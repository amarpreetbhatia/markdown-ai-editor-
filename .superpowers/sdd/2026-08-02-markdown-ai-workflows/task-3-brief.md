# Task 3 brief — Implement transformation prompts

Read this file as the complete requirements for Task 3. Base commit is 9f4af50.

Modify `src/extension.ts`, `docs/commands.md`, and `test/extension-prompts.test.mjs` only. Export a `TRANSFORMATION_PROMPTS` object (or equivalent stable source-inspection shape) with prompts for the existing grammar command, Clean Markdown, Skill, and PRD transformations. Register the command IDs already added by Task 1: `markdownAi.structureMarkdown`, `markdownAi.makeSkill`, and `markdownAi.createPrd`, routing each through the shared `processSelectedText(context, title, systemPrompt)` helper from Task 2.

Prompt requirements:

- Every prompt returns only transformed Markdown, preserves source facts, does not invent missing information, and avoids commentary outside the result.
- Clean Markdown adds sensible headings, lists, emphasis, spacing, and hierarchy while preserving meaning and Markdown structure.
- Skill produces a standalone `SKILL.md` with YAML frontmatter containing `name` and `description`, then a reusable workflow with steps, decisions, and quality checks. Follow the referenced VS Code skill format without copying unrelated prose.
- PRD produces a practical Markdown PRD with problem statement, goals, non-goals, users, requirements, user stories, acceptance criteria, risks, and open questions; use explicit assumptions/open questions for missing details.

Update docs/commands.md to explain all four commands, selection/full-document confirmation, keyboard chords, undo, and representative examples. Run `npm.cmd test` and `npm.cmd run typecheck`, commit with an imperative message, and write `.superpowers/sdd/2026-08-02-markdown-ai-workflows/task-3-report.md` containing changed files, commit, test output, and concerns. Return only status, commit, one-line test summary, and concerns.
