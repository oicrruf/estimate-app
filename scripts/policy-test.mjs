import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const valid = 'Víctor M. Reyes <vm.reyesal@gmail.com>';
const run = (title, author, body = '', branch = 'feature/AT-207-bootstrap-app') =>
  spawnSync(process.execPath, ['scripts/check-policy.mjs', title, author, body, branch], { encoding: 'utf8' });
assert.equal(run('feat(a2ui): bootstrap app (AT-207)', valid).status, 0);
assert.notEqual(run('Bootstrap app', valid).status, 0);
assert.notEqual(run('feat(a2ui): bootstrap app (AT-208)', valid).status, 0);
assert.notEqual(run('feat(a2ui): bootstrap app (AT-207)', 'Another Author <a@example.test>').status, 0);
assert.notEqual(run('feat(a2ui): bootstrap app (AT-207)', valid, 'Co-authored-by: Codex <bot@example.test>').status, 0);
