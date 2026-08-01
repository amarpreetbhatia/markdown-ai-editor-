# Privacy and limitations

## Managed mode

With the default managed engine, the model runs on your computer and the extension connects to it through `127.0.0.1`. Selected document text is processed locally rather than sent to Copilot or another cloud AI service.

The first setup downloads a pinned writing model and a platform-specific `llama-server` runtime over HTTPS. The extension checks the SHA-256 digest of each file before installation. The model and runtime are downloaded after you approve setup; neither is embedded in the extension package.

## Custom endpoints

When managed mode is disabled, selected text is sent to the URL in `markdownAi.customApiBaseUrl`. That service may be local, on your network, or hosted elsewhere. You are responsible for its security, authentication, and data policy.

## Review generated edits

Markdown AI Editor is an editing aid, not an authority. It can introduce wording changes, formatting errors, or factual mistakes. Review every result, especially names, numbers, links, technical details, and sensitive content.
