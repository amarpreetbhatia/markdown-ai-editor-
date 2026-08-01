# Settings

Open Settings with ++ctrl+comma++ and search for `Markdown AI Editor`, or open the Command Palette and run **Preferences: Open Settings (UI)**.

## Managed local engine

Managed mode is the default. After you approve first-time setup, it downloads pinned model and runtime files over HTTPS, verifies their SHA-256 checksums, and starts them locally. The pinned files are not configurable, so the extension can verify exactly what it installs.

| Setting | Default | When to change it |
| --- | --- | --- |
| `markdownAi.useManagedEngine` | `true` | Disable only when using your own API endpoint. |
| `markdownAi.model` | `SmolLM2-360M-Instruct-Q4_K_M` | Match the model identifier accepted by a custom endpoint. |

## Use a custom endpoint

If you run an OpenAI-compatible server yourself:

1. Set `markdownAi.useManagedEngine` to `false`.
2. Set `markdownAi.customApiBaseUrl` to the server’s API base URL, for example `http://127.0.0.1:8080/v1`.
3. Set `markdownAi.model` to a model name your server accepts.
4. Select text and run a Markdown AI command.

The extension sends requests to `<base URL>/chat/completions`, so include the `/v1` segment when your server expects it.

For a complete local example using a selectable Ollama model, see [Use Ollama locally](ollama.md).

!!! warning "Custom endpoint privacy"
    The local-model privacy statement does not apply to a custom endpoint. Read and trust the endpoint’s own data-handling policy before sending document text.
