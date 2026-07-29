# Privacy and limitations

## Managed mode

With the default managed engine, the model runs on your computer and the extension connects to it through `127.0.0.1`. Selected document text is processed locally rather than sent to Copilot or another cloud AI service.

The initial model download comes from the configured HTTPS URL. The extension checks its SHA-256 digest before installation.

## Custom endpoints

When managed mode is disabled, selected text is sent to the URL in `markdownAi.customApiBaseUrl`. That service may be local, on your network, or hosted elsewhere. You are responsible for its security, authentication, and data policy.

## Review generated edits

Markdown AI Editor is an editing aid, not an authority. It can introduce wording changes, formatting errors, or factual mistakes. Review every result, especially names, numbers, links, technical details, and sensitive content.
