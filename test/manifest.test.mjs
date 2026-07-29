import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

test('manifest exposes local Markdown AI commands for Markdown and plain text', () => {
    const commands = packageJson.contributes.commands.map((command) => command.command);
    assert.deepEqual(commands, ['markdownAi.fixGrammar', 'markdownAi.formatNotes']);
    assert.ok(packageJson.activationEvents.includes('onLanguage:markdown'));
    assert.ok(packageJson.activationEvents.includes('onLanguage:plaintext'));
    for (const item of packageJson.contributes.menus['editor/context']) {
        assert.match(item.when, /editorHasSelection/);
        assert.match(item.when, /resourceLangId == markdown/);
        assert.match(item.when, /resourceLangId == plaintext/);
    }
});

test('managed model defaults are explicit and use a trusted HTTPS source', () => {
    const settings = packageJson.contributes.configuration.properties;
    assert.equal(settings['markdownAi.useManagedEngine'].default, true);
    assert.match(settings['markdownAi.managedModelUrl'].default, /^https:\/\//);
    assert.match(settings['markdownAi.managedModelSha256'].default, /^[a-f0-9]{64}$/);
    assert.match(settings['markdownAi.useManagedEngine'].description, /1\.12 GB/);
});

test('release documentation contains no VS Code scaffold placeholder', async () => {
    const readme = await readFile(path.join(root, 'README.md'), 'utf8');
    assert.doesNotMatch(readme, /This is the README for your extension/);
    assert.match(readme, /local Llama 3\.2 1B model/);
});
