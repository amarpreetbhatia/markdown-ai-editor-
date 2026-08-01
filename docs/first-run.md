# First run

After you approve setup, Markdown AI downloads a local SmolLM2 English writing assistant and its runtime (about 271 MB for the model). Once installed, editing works offline.

For a detailed explanation of what is downloaded, how it stays local, and what happens when an editing command runs, read [Managed local model](local-model.md).

## Approve the local model

After activation, VS Code offers a one-click consent dialog. You can continue editing while setup runs; document text stays on your computer when the managed engine is used.

- Choose **Set up local model** to continue with the managed local engine.
- Choose **Use custom endpoint** if you already run an OpenAI-compatible service. VS Code opens the relevant setting; follow [Settings](settings.md).
- Dismiss the dialog to cancel. Run a command again when you are ready.

## What to expect

1. A progress notification displays percentage, speed, and estimated time while setup downloads.
2. The extension checks the downloaded file before installing it.
3. The model starts on a private `127.0.0.1` address. Startup can take up to 90 seconds.
4. Your command waits for setup, then updates the selected text. The assistant preserves Markdown where possible but may make mistakes.

!!! warning "Keep VS Code open"
    Cancelling the download or closing VS Code stops the request. Run the command again to retry; incomplete downloads are not installed.

The extension stops its managed model when it deactivates. A later request starts it again.

If you prefer to choose and manage your own local model, see [Use Ollama locally](ollama.md).
