import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'modelCatalog.ts'), 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const { defaultModel, selectRuntime } = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);

test('default managed model is official Qwen 3 0.6B Q8_0', () => {
    assert.equal(defaultModel.displayName, 'Qwen3-0.6B-Q8_0');
    assert.match(defaultModel.url, /Qwen3-0\.6B-GGUF/);
    assert.match(defaultModel.url, /Qwen3-0\.6B-Q8_0\.gguf$/);
    assert.equal(defaultModel.sha256, '9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031');
    assert.equal(defaultModel.bytes, 639_446_688);
});

test('selectRuntime returns the pinned runtime for each supported platform', () => {
    for (const [platform, architecture] of [['win32', 'x64'], ['darwin', 'x64'], ['darwin', 'arm64'], ['linux', 'x64']]) {
        const runtime = selectRuntime(platform, architecture);
        assert.ok(runtime);
        assert.equal(runtime.version, 'b10549');
        assert.match(runtime.url, /^https:\/\//);
        assert.match(runtime.sha256, /^[a-f0-9]{64}$/);
    }
});

test('selectRuntime rejects unsupported platforms and architectures', () => {
    assert.equal(selectRuntime('win32', 'arm64'), undefined);
    assert.equal(selectRuntime('freebsd', 'x64'), undefined);
});
