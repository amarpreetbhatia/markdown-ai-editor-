# Troubleshooting

## I cannot find the right-click command

Select text first and check that the active file is Markdown or plain text. You can always use ++ctrl+shift+p++ and search for `Markdown AI` in the Command Palette.

## I declined the download

Run a Markdown AI command again and select **Download model**. Or select **Use custom endpoint** and configure `markdownAi.useManagedEngine` as described in [Settings](settings.md).

## The download or integrity check fails

Check your internet connection and free disk space, then run the command again. Do not change the model URL or SHA-256 setting unless you trust the source and know the digest that belongs to that exact file.

## The local model does not start

Wait for the startup notification: the extension allows up to 90 seconds. Close other memory-intensive programs, confirm you have at least 4 GB of RAM available, then retry. If the problem continues, open **View: Output** in VS Code and select the extension’s output where available before reporting the error.

## My custom endpoint fails

Confirm the endpoint is running, the base URL is reachable from VS Code, and it supports OpenAI-compatible `POST /chat/completions` requests. Make sure the configured model name exists on that endpoint.

## The output is not what I expected

The model can make mistakes and does not verify facts. Undo with ++ctrl+z++, then retry with a smaller selection or edit the result manually. Do not use generated output as the sole review for sensitive, legal, medical, or factual content.
