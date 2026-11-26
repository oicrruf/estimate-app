import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyCanonicalHistory } from './check-canonical-api.mjs';

const root = mkdtempSync(join(tmpdir(), 'estimate-api-lineage-test-'));
const repo = join(root, 'api');
const appContract = join(root, 'app-openapi.json');
const contract = join(repo, 'contracts', 'openapi.json');
const run = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

try {
  mkdirSync(join(repo, 'contracts'), { recursive: true });
  run('init', '--initial-branch=develop');
  run('config', 'user.name', 'Synthetic Test');
  run('config', 'user.email', 'test@example.invalid');
  writeFileSync(contract, '{"openapi":"3.1.0"}\n');
  writeFileSync(appContract, '{"openapi":"3.1.0"}\n');
  run('add', 'contracts/openapi.json');
  run('commit', '-m', 'approved contract');
  const approved = run('rev-parse', 'HEAD');

  writeFileSync(join(repo, 'README.md'), 'same contract, later commit\n');
  run('add', 'README.md');
  run('commit', '-m', 'unrelated API change');
  const descendant = run('rev-parse', 'HEAD');
  assert.equal(verifyCanonicalHistory(repo, approved, descendant, appContract).toString(),
    '{"openapi":"3.1.0"}\n', 'same-content descendant passes');

  writeFileSync(contract, '{"openapi":"3.2.0"}\n');
  run('add', 'contracts/openapi.json');
  run('commit', '-m', 'changed contract');
  const changed = run('rev-parse', 'HEAD');
  assert.throws(() => verifyCanonicalHistory(repo, approved, changed, appContract),
    /contract bytes differ/, 'modified descendant fails');

  run('switch', '--orphan', 'divergent');
  mkdirSync(join(repo, 'contracts'), { recursive: true });
  writeFileSync(contract, '{"openapi":"3.1.0"}\n');
  run('add', 'contracts/openapi.json');
  run('commit', '-m', 'unrelated history, same bytes');
  const divergent = run('rev-parse', 'HEAD');
  assert.throws(() => verifyCanonicalHistory(repo, approved, divergent, appContract),
    /does not descend/, 'divergent ref fails even with matching bytes');
  process.stdout.write('Canonical API lineage synthetic cases passed.\n');
} finally {
  rmSync(root, { recursive: true, force: true });
}
