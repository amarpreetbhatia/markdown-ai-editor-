import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

test('manifest exposes every transformation under the Markdown AI Editor context submenu', () => {
    const commands = packageJson.contributes.commands;
    assert.deepEqual(commands.map((command) => command.command), [
        'markdownAi.fixGrammar',
        'markdownAi.formatNotes',
        'markdownAi.showLocalModelStatus',
        'markdownAi.structureMarkdown',
        'markdownAi.makeSkill',
        'markdownAi.makePrompt',
        'markdownAi.createPrd',
    ]);
    assert.deepEqual(commands.slice(-4).map(({ command, title }) => ({ command, title })), [
        { command: 'markdownAi.structureMarkdown', title: 'Markdown AI: Structure as Clean Markdown' },
        { command: 'markdownAi.makeSkill', title: 'Markdown AI: Convert to AI Skill Format' },
        { command: 'markdownAi.makePrompt', title: 'Markdown AI: Convert to AI Prompt Format' },
        { command: 'markdownAi.createPrd', title: 'Markdown AI: Convert to PRD (Product Requirements Document) Format' },
    ]);
    assert.ok(packageJson.activationEvents.includes('onLanguage:markdown'));
    assert.ok(packageJson.activationEvents.includes('onLanguage:plaintext'));
    assert.deepEqual(packageJson.contributes.submenus, [
        { id: 'markdownAiEditor', label: 'Markdown AI Editor' },
    ]);
    assert.deepEqual(packageJson.contributes.menus['editor/context'], [{
        submenu: 'markdownAiEditor',
        when: 'editorHasSelection && (resourceLangId == markdown || resourceLangId == plaintext)',
        group: '1_modification',
    }]);
    const workflowCommands = new Set([
        'markdownAi.fixGrammar',
        'markdownAi.formatNotes',
        'markdownAi.structureMarkdown',
        'markdownAi.makeSkill',
        'markdownAi.makePrompt',
        'markdownAi.createPrd',
    ]);
    const submenuItems = packageJson.contributes.menus.markdownAiEditor;
    assert.equal(submenuItems.length, workflowCommands.size);
    for (const item of submenuItems) {
        assert.ok(workflowCommands.has(item.command));
        assert.match(item.when, /editorHasSelection/);
        assert.match(item.when, /resourceLangId == markdown/);
        assert.match(item.when, /resourceLangId == plaintext/);
        assert.match(item.group, /^1_transformation@/);
    }
});

test('manifest binds every core transformation chord for Windows, Linux, and macOS', () => {
    assert.deepEqual(packageJson.contributes.keybindings, [
        { command: 'markdownAi.fixGrammar', key: 'ctrl+m f', mac: 'cmd+m f', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.formatNotes', key: 'ctrl+m c', mac: 'cmd+m c', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.structureMarkdown', key: 'ctrl+m m', mac: 'cmd+m m', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.makeSkill', key: 'ctrl+m s', mac: 'cmd+m s', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.makePrompt', key: 'ctrl+m a', mac: 'cmd+m a', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
        { command: 'markdownAi.createPrd', key: 'ctrl+m p', mac: 'cmd+m p', when: 'editorTextFocus && (resourceLangId == markdown || resourceLangId == plaintext)' },
    ]);
});

test('managed model setup is enabled with clear first-run guidance', () => {
    const settings = packageJson.contributes.configuration.properties;
    assert.equal(settings['markdownAi.useManagedEngine'].default, true);
    assert.equal(settings['markdownAi.managedModelUrl'], undefined);
    assert.equal(settings['markdownAi.managedModelSha256'], undefined);
    assert.match(settings['markdownAi.useManagedEngine'].description, /640 MB/);
    assert.equal(settings['markdownAi.model'].default, 'Qwen3-0.6B-Q8_0');
});

test('manifest identifies the Marketplace release and its public resources', () => {
    assert.equal(packageJson.version, '0.0.3');
    assert.match(packageJson.description, /Qwen3/);
    assert.equal(packageJson.publisher, 'AmarpreetBhatia');
    assert.equal(packageJson.license, 'SEE LICENSE IN LICENSE');
    assert.equal(packageJson.pricing, 'Free');
    assert.equal(packageJson.repository.url, 'https://github.com/amarpreetbhatia/markdown-ai-editor-.git');
    assert.equal(packageJson.bugs.url, 'https://github.com/amarpreetbhatia/markdown-ai-editor-/issues');
    assert.equal(packageJson.homepage, 'https://amarpreetbhatia.github.io/markdown-ai-editor-/');
});

test('version 0.0.3 documentation covers Qwen, prerequisites, and token hygiene', async () => {
    const [readme, index, releaseNotes, localModel, commands, mkdocsConfig] = await Promise.all([
        readFile(path.join(root, 'README.md'), 'utf8'),
        readFile(path.join(root, 'docs', 'index.md'), 'utf8'),
        readFile(path.join(root, 'docs', 'releases', '0.0.3.md'), 'utf8'),
        readFile(path.join(root, 'docs', 'local-model.md'), 'utf8'),
        readFile(path.join(root, 'docs', 'commands.md'), 'utf8'),
        readFile(path.join(root, 'mkdocs.yml'), 'utf8'),
    ]);

    assert.match(readme, /Version 0\.0\.3/);
    assert.match(index, /Prerequisites/);
    assert.match(index, /token/i);
    assert.match(releaseNotes, /Qwen3-0\.6B-Q8_0/);
    assert.match(releaseNotes, /Convert to AI Prompt Format/);
    assert.match(localModel, /dynamic port/);
    assert.match(commands, /Convert to AI Prompt Format/);
    assert.match(mkdocsConfig, /Version 0\.0\.3: releases\/0\.0\.3\.md/);
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

test('README documents local VSIX packaging and installation', async () => {
    const readme = await readFile(path.join(root, 'README.md'), 'utf8');

    assert.match(readme, /## Local Testing & Development/);
    assert.match(readme, /npm install/);
    assert.match(readme, /npm test/);
    assert.match(readme, /npm run typecheck/);
    assert.match(readme, /npm run package/);
    assert.match(readme, /vsce package/);
    assert.match(readme, /code --install-extension markdown-ai-editor-\*\.vsix/);
});

test('VSIX excludes development-only agent and documentation artifacts', async () => {
    const vscodeIgnore = await readFile(path.join(root, '.vscodeignore'), 'utf8');

    for (const path of ['.agents/**', '.continue/**', '.kiro/**', '.kirograph/**', '.superpowers/**']) {
        assert.ok(vscodeIgnore.includes(path));
    }
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
