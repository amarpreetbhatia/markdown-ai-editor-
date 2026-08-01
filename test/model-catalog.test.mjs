import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'modelCatalog.ts'), 'utf8');
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const { selectRuntime } = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);

test('selectRuntime returns the pinned runtime for each supported platform', () => {
    for (const [platform, architecture] of [['win32', 'x64'], ['darwin', 'x64'], ['darwin', 'arm64'], ['linux', 'x64']]) {
        const runtime = selectRuntime(platform, architecture);
        assert.ok(runtime);
        assert.equal(runtime.version, 'b9637');
        assert.match(runtime.url, /^https:\/\//);
        assert.match(runtime.sha256, /^[a-f0-9]{64}$/);
    }
});

test('selectRuntime rejects unsupported platforms and architectures', () => {
    assert.equal(selectRuntime('win32', 'arm64'), undefined);
    assert.equal(selectRuntime('freebsd', 'x64'), undefined);
});
