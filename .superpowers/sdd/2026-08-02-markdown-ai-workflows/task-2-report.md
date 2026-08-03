# Task 2 report — Extract shared transformation flow

## Changed files

- `src/extension.ts`
  - Added the exported `getTargetText` helper.
  - Added the exported `processSelectedText(context, title, systemPrompt)` shared flow.
  - Updated the existing Grammar and Clean Markdown commands to use explicit titles.
  - Empty selections now require **Transform entire document** confirmation before a request or edit.
  - Whole-document replacements use the one returned document range in one `editor.edit` call.
- `test/extension-prompts.test.mjs`
  - Added source-level coverage for the shared helper signature, confirmation flow, existing command prompts, and progress title.

## Commit

`0aa6ed3297a3f98f688bbb08d20cdde59eaa69cb` — `Extract shared Markdown transformation flow`

## Verification

```text
npm.cmd test
14 passing, 0 failing

npm.cmd run typecheck
tsc --noEmit completed successfully
```

## Concerns

- The repository's current automated tests inspect extension source rather than instantiating a VS Code editor. The confirmation path should still be manually exercised in an Extension Development Host when the full workflow is tested.

## Review fix

The review found that the cancellation listener was registered only after managed-engine startup completed. A cancellation during startup could therefore be missed and let the request continue.

- `AbortController` creation and the cancellation listener now occur before `getApiBaseUrl` starts managed-engine setup.
- `throwIfCanceled` checks cancellation after startup and before the single editor edit, preventing a request or edit after cancellation.
- The listener is disposed in `finally`.
- Added source-order tests that enforce the controller/listener ordering, cancellation checks before request/edit, and the single-edit whole-document invariant.

### Review-fix verification

```text
npm.cmd test
16 passing, 0 failing

npm.cmd run typecheck
tsc --noEmit completed successfully
```
