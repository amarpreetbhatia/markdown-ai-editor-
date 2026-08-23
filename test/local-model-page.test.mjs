import assert from 'node:assert/strict';
import test from 'node:test';
import { localModelPageHtml } from '../src/localModelPage.js';

test('localModelPageHtml generates safe HTML with expected values', () => {
  const baseUrl = 'http://127.0.0.1:8080/v1';
  const modelName = "SmolLM2-360M-Instruct-Q4_K_M";
  const html = localModelPageHtml(baseUrl, modelName);
  // Basic structure
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<title>Local Model</title>'));
  // Escaped URL and port
  assert.ok(html.includes(`<code>${baseUrl}</code>`));
  assert.ok(html.includes('<code>8080</code>'));
  // Escaped model name
  assert.ok(html.includes(`<strong>${modelName}</strong>`));
  // Presence of external links
  assert.ok(html.includes('https://amarpreetbhatia.github.io/markdown-ai-editor-/'));
  assert.ok(html.includes('https://amarpreetbhatia.github.io/markdown-ai-editor-/local-model/'));
});
