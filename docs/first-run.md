# First run

The first request in managed mode downloads an executable local Llama 3.2 1B model. This one-time download is about 1.12 GB.

## Approve the local model

After you run a Markdown AI command, VS Code shows a consent dialog explaining that document text stays on your computer when the managed engine is used.

- Choose **Download model** to continue with the managed local engine.
- Choose **Use custom endpoint** if you already run an OpenAI-compatible service. VS Code opens the relevant setting; follow [Settings](settings.md).
- Dismiss the dialog to cancel. Run a command again when you are ready.

## What to expect

1. A progress notification displays while the model downloads.
2. The extension checks the downloaded file before installing it.
3. The model starts on a private `127.0.0.1` address. Startup can take up to 90 seconds.
4. Your command then updates the selected text.

!!! warning "Keep VS Code open"
    Cancelling the download or closing VS Code stops the request. Run the command again to retry; incomplete downloads are not installed.

The extension stops its managed model when it deactivates. A later request starts it again.
