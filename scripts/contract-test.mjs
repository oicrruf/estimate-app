import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dir = mkdtempSync(join(tmpdir(), 'estimate-contract-'));
try {
  const reference = JSON.parse(readFileSync('contracts/openapi.json', 'utf8'));
  const file = join(dir, 'api.json');
  const check = () => spawnSync(process.execPath, ['scripts/generate-contract.mjs', '--check', '--api-export', file], { encoding: 'utf8' });
  writeFileSync(file, JSON.stringify(reference));
  assert.equal(check().status, 0, 'matching canonical export passes');
  reference.info.version = '0.2.0';
  writeFileSync(file, JSON.stringify(reference));
  assert.notEqual(check().status, 0, 'canonical drift fails');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
