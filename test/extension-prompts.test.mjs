import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'extension.ts'), 'utf8');

test('shared transformation flow has a title, prompt, and selection target helper', () => {
    assert.match(source, /processSelectedText\(\s*context: vscode\.ExtensionContext,\s*title: string,\s*systemPrompt: string/);
    assert.match(source, /getTargetText\(editor: vscode\.TextEditor\): Promise<\{ text: string; range: vscode\.Range \} \| undefined>/);
});

test('empty selections require explicit whole-document confirmation', () => {
    assert.match(source, /showWarningMessage\([\s\S]*?'Transform entire document',[\s\S]*?'Cancel'/);
    assert.match(source, /choice !== 'Transform entire document'/);
    assert.match(source, /editor\.document\.getText\(\)/);
});

test('existing commands use the shared transformation flow with progress titles', () => {
    assert.match(source, /'Fix Grammar & Refine',[\s\S]*?'You are an expert editor/);
    assert.match(source, /'Convert to Clean Markdown',[\s\S]*?'You are a Markdown formatting assistant/);
    assert.match(source, /title: `Markdown AI: \$\{title\}`/);
});

test('cancellation is registered before startup and checked before requests and edits', () => {
    const controller = source.indexOf('const controller = new AbortController();');
    const endpoint = source.indexOf('const apiBaseUrl = await getApiBaseUrl(context);');
    const fetchRequest = source.indexOf('const response = await fetch(');
    const edit = source.indexOf('await editor.edit(');
    const cancellationChecks = [...source.matchAll(/throwIfCanceled\(token, controller\);/g)].map((match) => match.index);

    assert.ok(controller >= 0 && controller < endpoint, 'the controller must exist before managed startup');
    assert.match(source, /token\.onCancellationRequested\(\(\) => controller\.abort\(\)\)/);
    assert.ok(cancellationChecks[0] > endpoint && cancellationChecks[0] < fetchRequest, 'cancellation must stop a request after startup');
    assert.ok(cancellationChecks[1] > fetchRequest && cancellationChecks[1] < edit, 'cancellation must stop an edit after a response');
});

test('whole-document transformations use one editor edit', () => {
    assert.equal((source.match(/await editor\.edit\(/g) ?? []).length, 1);
    assert.match(source, /editBuilder\.replace\(target\.range, resultText\)/);
});
