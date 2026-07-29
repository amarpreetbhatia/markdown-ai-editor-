# Marketplace Release Checklist

Before publishing, replace `local-dev` in `package.json` with the exact publisher ID created in the Visual Studio Marketplace. Do not store a personal access token in the repository or settings.

Run these checks from the repository root:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run package
npx.cmd @vscode/vsce package
```

Install the generated `.vsix` in a clean VS Code profile and verify both commands in Markdown and plain-text documents. Exercise download approval, cancelled download, model startup failure, successful managed editing, custom endpoint editing, and cancellation while processing.

Before each release, update `version`, `CHANGELOG.md`, the README, and marketplace publisher metadata. Confirm the model URL still resolves over HTTPS and review the Llama 3.2 license and model-card requirements. Publish only after the packaged artifact passes the clean-profile check.
