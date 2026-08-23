# Task 3 report — Implement transformation prompts

## Changed files

- `src/extension.ts`
  - Added the exported `TRANSFORMATION_PROMPTS` catalog for grammar, clean Markdown, Skill, and PRD transformations.
  - Routed the existing grammar and clean-Markdown commands plus `structureMarkdown`, `makeSkill`, and `createPrd` through `processSelectedText`.
- `test/extension-prompts.test.mjs`
  - Added coverage for prompt constraints and all three workflow command registrations.
  - Updated existing shared-flow assertions to inspect the prompt catalog.
- `docs/commands.md`
  - Documented the four workflow commands, shortcuts, examples, selection confirmation, cancellation, and undo.

## Commit

`66519a05383c2cbab162e0658d40f0703e1e581c` — `Add Markdown transformation prompts`

## Verification

```text
npm.cmd test
17 passing, 0 failing

npm.cmd run typecheck
tsc --noEmit completed successfully
```

## Concerns

- The prompts are covered through source inspection. Their practical quality should be reviewed against representative Markdown, skill, and PRD examples in an Extension Development Host.
- `markdownAi.formatNotes` remains as the existing clean-Markdown command and uses the same prompt as `markdownAi.structureMarkdown` for backward compatibility.
