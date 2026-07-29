# Settings

Open Settings with ++ctrl+comma++ and search for `Markdown AI Editor`, or open the Command Palette and run **Preferences: Open Settings (UI)**.

## Managed local engine

Managed mode is the default. It downloads the configured model, verifies it, and starts it locally.

| Setting | Default | When to change it |
| --- | --- | --- |
| `markdownAi.useManagedEngine` | `true` | Disable only when using your own API endpoint. |
| `markdownAi.managedModelUrl` | Official HTTPS model URL | Change only to a trusted HTTPS source. |
| `markdownAi.managedModelSha256` | Pinned SHA-256 digest | Update this whenever you change the model URL. |
| `markdownAi.model` | `Llama-3.2-1B-Instruct` | Match the model identifier accepted by your endpoint. |

## Use a custom endpoint

If you run an OpenAI-compatible server yourself:

1. Set `markdownAi.useManagedEngine` to `false`.
2. Set `markdownAi.customApiBaseUrl` to the server’s API base URL, for example `http://127.0.0.1:8080/v1`.
3. Set `markdownAi.model` to a model name your server accepts.
4. Select text and run a Markdown AI command.

The extension sends requests to `<base URL>/chat/completions`, so include the `/v1` segment when your server expects it.

!!! warning "Custom endpoint privacy"
    The local-model privacy statement does not apply to a custom endpoint. Read and trust the endpoint’s own data-handling policy before sending document text.
