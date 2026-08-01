import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'managedEngine.ts'), 'utf8');

test('managed engine verifies resumable downloads and starts a separate runtime', () => {
    assert.match(source, /connectionTimeoutMs\s*=\s*30_000/);
    assert.match(source, /Range: `bytes=\$\{offset\}-`/);
    assert.match(source, /failed its security checksum verification/);
    assert.match(source, /spawn\(executable, \['--model'/);
    assert.match(source, /\.download/);
});
