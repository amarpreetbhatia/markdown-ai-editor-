# Use Ollama locally

Ollama is an alternative local model runner. Use it when you want to choose a different model, already use Ollama, or are on a platform that does not support the managed runtime.

Markdown AI Editor sends standard OpenAI-compatible chat-completion requests. Ollama exposes that compatibility endpoint locally at `http://127.0.0.1:11434/v1`, so no extension code change is needed. See Ollama's [OpenAI compatibility documentation](https://docs.ollama.com/api/openai-compatibility).

## 1. Install Ollama

Install Ollama for your operating system from [ollama.com](https://ollama.com/). Once installed, start its local service if it is not already running:

```shell
ollama serve
```

On many desktop installations Ollama starts automatically, so this command may report that the address is already in use. That is fine: continue to the next step.

## 2. Download a model

For a compact first test, download a model such as `llama3.2`:

```shell
ollama pull llama3.2
```

Confirm that Ollama can run it:

```shell
ollama run llama3.2 "Reply with: Ollama is ready."
```

Use the exact model name that `ollama list` displays, including an optional tag such as `llama3.2:latest`.

## 3. Configure Markdown AI Editor

1. In VS Code, open Settings and search for `Markdown AI Editor`.
2. Disable **Markdown Ai: Use Managed Engine** (`markdownAi.useManagedEngine = false`). This prevents the extension from downloading its managed model.
3. Set **Markdown Ai: Custom Api Base Url** to:

   ```text
   http://127.0.0.1:11434/v1
   ```

4. Set **Markdown Ai: Model** to the Ollama model name, for example:

   ```text
   llama3.2
   ```

The `/v1` part is important: it selects Ollama's OpenAI-compatible API. Markdown AI Editor appends `/chat/completions` itself.

## 4. Test the connection

Select a short paragraph in a Markdown or plain-text document and run **Markdown AI: Fix Grammar & Refine**. Ollama should load the model on the first request and return an edit.

If the command fails, test the same endpoint from a terminal:

```shell
curl http://127.0.0.1:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"Reply with: Ollama is ready."}]}'
```

If this request succeeds but the extension does not, double-check the VS Code settings and restart VS Code after changing them.

## Privacy note

The example above uses `127.0.0.1`, so document text stays on your computer while Ollama is local. Do not change the URL to a network or cloud service unless you trust its security and data-handling policy.
