function esc(s) {
  return s.replace(/[\u0026\u003c\u003e\"']/g, function (c) {
    switch (c) {
      case '\u0026': return '\u0026amp;';
      case '\u003c': return '\u0026lt;';
      case '\u003e': return '\u0026gt;';
      case '"': return '\u0026quot;';
      case "'": return '\u0026#39;';
      default: return c;
    }
  });
}

function localModelPageHtml(baseUrl, modelName) {
  const safeUrl = esc(baseUrl);
  const safeModel = esc(modelName);
  const portMatch = safeUrl.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : '8080';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Local Model</title>
  <style>body{font-family:sans-serif;padding:1em;}</style>
</head>
<body>
  <h2>Local Model Status</h2>
  <p>Endpoint: <code>${safeUrl}</code></p>
  <p>Port: <code>${port}</code></p>
  <p>Model: <strong>${safeModel}</strong></p>
  <p>This model runs locally, offline, with lightweight resources.</p>
  <p>Learn more: <a href="https://amarpreetbhatia.github.io/markdown-ai-editor-/">Documentation</a> | <a href="https://amarpreetbhatia.github.io/markdown-ai-editor-/local-model/">Local Model FAQ</a></p>
  <script>
    const vscode = acquireVsCodeApi();
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('http')) {
        e.preventDefault();
        vscode.postMessage({ command: 'open', url: target.getAttribute('href') });
      }
    });
  </script>
</body>
</html>`;
}

module.exports = { localModelPageHtml };
