import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'localEngine.ts'), 'utf8');

test('managed engine reports download stalls and startup progress', () => {
    assert.match(source, /DOWNLOAD_STALL_TIMEOUT_MS\s*=\s*30_000/);
    assert.match(source, /downloaded.*formatBytes\(speed\).*\/s/);
    assert.match(source, /Starting local model/);
    assert.match(source, /\.download/);
});
