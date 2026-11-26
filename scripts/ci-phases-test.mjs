import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { requiredPhases, verifyCiPhases } from './check-ci-phases.mjs';

const successful = () => Object.fromEntries(requiredPhases.map((phase) => [phase, { result: 'success' }]));
assert.doesNotThrow(() => verifyCiPhases(successful()), 'all seven successes pass');

for (const phase of requiredPhases) {
  for (const result of ['failure', 'skipped', 'cancelled', '', undefined]) {
    const needs = successful();
    needs[phase] = { result };
    assert.throws(() => verifyCiPhases(needs), /did not succeed/, `${phase}=${result} fails`);
  }
  const missing = successful();
  delete missing[phase];
  assert.throws(() => verifyCiPhases(missing), /does not match/, `missing ${phase} fails`);
}

const extra = successful();
extra['unreviewed-phase'] = { result: 'success' };
assert.throws(() => verifyCiPhases(extra), /does not match/, 'unexpected phase fails');
assert.throws(() => verifyCiPhases(null), /malformed/, 'missing needs object fails');

const cli = (needs) => spawnSync(process.execPath, ['scripts/check-ci-phases.mjs'], {
  encoding: 'utf8',
  env: { ...process.env, NEEDS_JSON: JSON.stringify(needs) },
});
assert.equal(cli(successful()).status, 0, 'the CI entry point accepts all successes');
const failedCli = successful();
failedCli['contracts'] = { result: 'failure' };
assert.equal(cli(failedCli).status, 1, 'the CI entry point fails on a failed phase');
process.stdout.write('CI phase aggregation synthetic cases passed.\n');
