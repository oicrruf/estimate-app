import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { verifyCanonicalHistory } from './check-canonical-api.mjs';

const fixture = resolve('tests/fixtures/at237-preview-openapi.json');
const approved = resolve('contracts/openapi.json');
const dir = mkdtempSync(join(tmpdir(), 'estimate-intake-lineage-'));
const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8' }).trim();
try {
  git('init', '--quiet');
  git('config', 'user.name', 'Synthetic Test');
  git('config', 'user.email', 'synthetic@example.invalid');
  mkdirSync(join(dir, 'contracts'));
  const path = join(dir, 'contracts/openapi.json');
  writeFileSync(path, readFileSync(approved));
  git('add', '.');
  git('commit', '--quiet', '-m', 'approved synthetic contract');
  const head = git('rev-parse', 'HEAD');
  assert.doesNotThrow(() => verifyCanonicalHistory(dir, head, head, approved));
  writeFileSync(path, readFileSync(fixture));
  git('add', '.');
  git('commit', '--quiet', '-m', 'descendant preview contract');
  const preview = git('rev-parse', 'HEAD');
  assert.equal(
    spawnSync('git', ['-C', dir, 'merge-base', '--is-ancestor', head, preview]).status,
    0,
  );
  assert.throws(() => verifyCanonicalHistory(dir, head, preview, approved), /bytes differ/);
  assert.equal(
    spawnSync(process.execPath, [
      'scripts/generate-intake-preview.mjs',
      '--check',
      '--api-export',
      fixture,
    ]).status,
    0,
  );
  const drift = join(dir, 'drift.json');
  const changed = JSON.parse(readFileSync(fixture, 'utf8'));
  changed.paths['/v1/chat/intake-preview'].post.operationId = 'changed';
  writeFileSync(drift, JSON.stringify(changed));
  assert.notEqual(
    spawnSync(process.execPath, [
      'scripts/generate-intake-preview.mjs',
      '--check',
      '--api-export',
      drift,
    ]).status,
    0,
  );
  process.stdout.write(
    'Synthetic lineage: approved head passes, descendant preview blocked by canonical gate; pinned preview generator passes only reviewed bytes.\n',
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
