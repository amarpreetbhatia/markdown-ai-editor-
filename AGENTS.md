# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript VS Code extension for refining Markdown with a local AI endpoint. Keep extension-facing behavior in `src/extension.ts`: command registration, configuration lookup, API calls, and editor edits. Keep lifecycle and local-engine concerns in `src/engineManager.ts`. The bundled extension entry point is generated at `dist/extension.js`; do not edit `dist/` by hand. Extension metadata, commands, and settings are declared in `package.json`. Build configuration lives in `esbuild.js` and `tsconfig.json`; ESLint rules are in `eslint.config.mjs`.

## Build, Test, and Development Commands

- `npm install` installs the locked development dependencies.
- `npm run compile` bundles `src/extension.ts` to `dist/extension.js` for local development.
- `npm run watch` rebuilds the bundle whenever a source file changes.
- `npm run package` creates the minified production bundle; it also runs automatically before VS Code extension publishing.

Use VS Code's **Run Extension** launch configuration (typically `F5`) to test the extension in an Extension Development Host. There is currently no `npm test` script or committed automated test suite; validate both Markdown AI commands with selected text, and test managed-engine and custom-endpoint settings when changing request or engine code.

## Coding Style & Naming Conventions

Write strict TypeScript targeting ES2022. Follow the existing four-space indentation, single quotes, semicolons, and trailing commas in multiline literals. Use `camelCase` for functions, variables, and imports; use `PascalCase` for types/classes. Prefer small focused helpers and explicit return types for exported functions. Run the configured ESLint checks when available; heed its warnings for braces, strict equality, semicolons, and thrown errors.

## Commit & Pull Request Guidelines

This repository has no established commit history yet. Use concise, imperative commit subjects such as `Add custom endpoint validation` or `Handle engine startup failures`. Keep each commit focused. Pull requests should explain the user-visible behavior, note affected settings or commands, link relevant issues, and include screenshots or a short recording for UI-facing changes. State the manual verification performed and avoid committing `dist/`, `node_modules/`, `.vscode-test/`, or `.vsix` artifacts unless a release intentionally requires them.

## Security & Configuration

Do not hard-code credentials or private endpoint URLs. Treat configured API URLs and downloaded engine binaries as untrusted inputs: preserve localhost defaults, surface actionable errors, and avoid logging selected document text or secrets.
