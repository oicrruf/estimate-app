import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const dir = mkdtempSync(join(tmpdir(), 'estimate-pr-head-'));
const script = fileURLToPath(new URL('./check-pr-head.mjs', import.meta.url));
const title = 'feat(a2ui): bootstrap app (AT-207)';
const branch = 'feature/AT-207-bootstrap-app';
const git = (args, env = process.env) => execFileSync('git', args, { cwd: dir, env, encoding: 'utf8' }).trim();
const commit = (name, email, message) => {
  const env = { ...process.env, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email };
  git(['commit', '--allow-empty', '-q', '-m', message], env);
  return git(['rev-parse', 'HEAD']);
};
const check = (sha) => spawnSync(process.execPath, [script, title, branch, sha], { cwd: dir, encoding: 'utf8' });
try {
  git(['init', '-q']);
  const goodHead = commit('Víctor M. Reyes', 'vm.reyesal@gmail.com', 'feat(a2ui): bootstrap app (AT-207)');
  const syntheticMerge = commit('GitHub', 'noreply@github.com', 'Synthetic merge');
  assert.equal(check(goodHead).status, 0, 'explicit PR head passes even when checkout HEAD is a synthetic merge');
  assert.notEqual(check(syntheticMerge).status, 0, 'synthetic merge author fails when used as PR head');
  const trailerHead = commit('Víctor M. Reyes', 'vm.reyesal@gmail.com', 'feat(a2ui): update app (AT-207)\n\nCo-authored-by: Codex <bot@example.test>');
  assert.notEqual(check(trailerHead).status, 0, 'actual PR head body is checked for forbidden trailer');
  assert.notEqual(check('0'.repeat(40)).status, 0, 'unknown PR head fails');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
