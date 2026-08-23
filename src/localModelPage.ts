import * as vscode from "vscode";

/** Escape HTML special characters */
function esc(s: string): string {
  return s.replace(/[\u0026\u003c\u003e\"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

/**
 * Generate safe HTML for the Local Model status webview.
 * All interpolated values are escaped to prevent HTML injection.
 */
export function localModelPageHtml(baseUrl: string, modelName: string): string {
  const safeUrl = esc(baseUrl);
  const safeModel = esc(modelName);
  const port = safeUrl.match(/:(\d+)/)?.[1] ?? "8080";
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
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('http')) {
        e.preventDefault();
        vscode.postMessage({ command: 'open', url: target.getAttribute('href') });
      }
    });
  </script>
</body>
</html>`;
}
