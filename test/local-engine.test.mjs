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

test('managed engine shows its dynamic local port only while running', () => {
    assert.match(source, /let activePort: number \| undefined/);
    assert.match(source, /Local model ready \(port \$\{activePort\}\)/);
    assert.match(source, /activePort = port/);
    assert.match(source, /activePort = undefined/);
});

test('managed engine removes its port when the runtime exits', () => {
    assert.match(source, /server\.on\('exit', \(\) => \{\s*activePort = undefined;/);
});
