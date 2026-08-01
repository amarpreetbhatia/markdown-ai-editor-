# Marketplace Release Design

## Goal

Publish version 0.0.1 of Markdown AI Editor to the Visual Studio Marketplace as `AmarpreetBhatia.markdown-ai-editor`.

## Scope

Update only Marketplace-facing manifest metadata: publisher, license reference, repository links, issue tracker, homepage, and free pricing. Rebuild the bundled extension, validate the generated VSIX, and publish it with the authenticated `vsce` CLI.

## Safety

Do not modify the existing user change in `src/extension.ts`. Do not store a token in the repository. Stop before publishing if authentication or publisher access is unavailable.

## Verification

Run the repository tests, TypeScript check, production bundle, and `vsce package`; inspect the resulting VSIX manifest and file list before publishing.
