import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

test('manifest exposes the Markdown AI workflow commands in the editor context menu', () => {
    const commands = packageJson.contributes.commands;
    assert.deepEqual(commands.map((command) => command.command), [
        'markdownAi.fixGrammar',
        'markdownAi.formatNotes',
        'markdownAi.showLocalModelStatus',
        'markdownAi.structureMarkdown',
        'markdownAi.makeSkill',
        'markdownAi.createPrd',
    ]);
    assert.deepEqual(commands.slice(-3).map(({ command, title }) => ({ command, title })), [
        { command: 'markdownAi.structureMarkdown', title: 'Markdown AI: Structure as Clean Markdown' },
        { command: 'markdownAi.makeSkill', title: 'Markdown AI: Make a Skill' },
        { command: 'markdownAi.createPrd', title: 'Markdown AI: Create PRD' },
    ]);
    assert.ok(packageJson.activationEvents.includes('onLanguage:markdown'));
    assert.ok(packageJson.activationEvents.includes('onLanguage:plaintext'));
    const workflowCommands = new Set([
        'markdownAi.structureMarkdown',
        'markdownAi.makeSkill',
        'markdownAi.createPrd',
    ]);
    for (const item of packageJson.contributes.menus['editor/context'].filter((item) => workflowCommands.has(item.command))) {
        assert.match(item.when, /editorHasSelection/);
        assert.match(item.when, /resourceLangId == markdown/);
        assert.match(item.when, /resourceLangId == plaintext/);
        assert.match(item.group, /^1_modification@/);
    }
});

test('manifest binds Markdown AI workflow chords for Windows, Linux, and macOS', () => {
    assert.deepEqual(packageJson.contributes.keybindings, [
        { command: 'markdownAi.fixGrammar', key: 'ctrl+m f', mac: 'cmd+m f', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.formatNotes', key: 'ctrl+m c', mac: 'cmd+m c', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.makeSkill', key: 'ctrl+m s', mac: 'cmd+m s', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.createPrd', key: 'ctrl+m p', mac: 'cmd+m p', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
    ]);
});

test('managed model setup is enabled with clear first-run guidance', () => {
    const settings = packageJson.contributes.configuration.properties;
    assert.equal(settings['markdownAi.useManagedEngine'].default, true);
    assert.equal(settings['markdownAi.managedModelUrl'], undefined);
    assert.equal(settings['markdownAi.managedModelSha256'], undefined);
    assert.match(settings['markdownAi.useManagedEngine'].description, /271 MB/);
});

test('manifest identifies the Marketplace release and its public resources', () => {
    assert.equal(packageJson.publisher, 'AmarpreetBhatia');
    assert.equal(packageJson.license, 'SEE LICENSE IN LICENSE');
    assert.equal(packageJson.pricing, 'Free');
    assert.equal(packageJson.repository.url, 'https://github.com/amarpreetbhatia/markdown-ai-editor-.git');
    assert.equal(packageJson.bugs.url, 'https://github.com/amarpreetbhatia/markdown-ai-editor-/issues');
    assert.equal(packageJson.homepage, 'https://amarpreetbhatia.github.io/markdown-ai-editor-/');
});

test('release documentation contains no VS Code scaffold placeholder', async () => {
    const readme = await readFile(path.join(root, 'README.md'), 'utf8');
    assert.doesNotMatch(readme, /This is the README for your extension/);
    assert.match(readme, /local AI model/);
});

test('release documentation links to the hosted user guide', async () => {
    const readme = await readFile(path.join(root, 'README.md'), 'utf8');
    const mkdocsConfig = await readFile(path.join(root, 'mkdocs.yml'), 'utf8');

    assert.match(readme, /https:\/\/amarpreetbhatia\.github\.io\/markdown-ai-editor-\//);
    assert.match(mkdocsConfig, /theme:\s*\n\s*name: material/);
});

test('documentation deployment follows the repository default branch', async () => {
    const workflow = await readFile(path.join(root, '.github', 'workflows', 'deploy-docs.yml'), 'utf8');

    assert.match(workflow, /branches: \[main\]/);
    assert.doesNotMatch(workflow, /branches: \[master\]/);
});

test('documentation deployment uses Node 24-compatible Pages actions', async () => {
    const workflow = await readFile(path.join(root, '.github', 'workflows', 'deploy-docs.yml'), 'utf8');

    assert.match(workflow, /actions\/configure-pages@v6/);
    assert.match(workflow, /actions\/upload-pages-artifact@v5/);
    assert.match(workflow, /actions\/deploy-pages@v5/);
    assert.doesNotMatch(workflow, /actions\/(configure-pages|upload-pages-artifact|deploy-pages)@v[1-4]\b/);
});
