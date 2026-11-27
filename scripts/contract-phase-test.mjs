import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const originalScript = readFileSync(resolve('scripts/generate-contract.mjs'), 'utf8');
const generatedHealth = readFileSync(resolve('src/app/api/health.generated.ts'));
const twoRoute = readFileSync(resolve('tests/fixtures/at237-preview-openapi.json'));
const reviewedFive = readFileSync(resolve('tests/fixtures/at209-scope-review-openapi.json'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const dir = mkdtempSync(join(tmpdir(), 'estimate-contract-phases-'));
mkdirSync(join(dir, 'contracts'));
mkdirSync(join(dir, 'src/app/api'), { recursive: true });
writeFileSync(join(dir, 'src/app/api/health.generated.ts'), generatedHealth);

function check(bytes, phase, expectedError) {
  const source = join(dir, 'contracts/openapi.json');
  writeFileSync(source, bytes);
  let script = originalScript;
  if (phase) {
    const reviewedHash = phase === 'two-route' ? hash(twoRoute) : hash(reviewedFive);
    assert.equal(script.split(reviewedHash).length, 2);
    script = script.replace(reviewedHash, hash(bytes));
  }
  const scriptPath = join(dir, 'generate-contract.mjs');
  writeFileSync(scriptPath, script);
  const result = spawnSync(process.execPath, [scriptPath, '--check'], { cwd: dir, encoding: 'utf8' });
  if (expectedError) {
    assert.notEqual(result.status, 0, `Unexpected acceptance of ${expectedError}`);
    assert.match(result.stderr, new RegExp(expectedError));
  } else {
    assert.equal(result.status, 0, result.stderr);
  }
}

function changed(bytes, mutate) {
  const value = JSON.parse(bytes.toString('utf8'));
  mutate(value);
  return Buffer.from(JSON.stringify(value));
}

try {
  check(twoRoute);
  check(reviewedFive);
  check(changed(twoRoute, (spec) => { spec.paths['/health'].get.operationId = 'changed'; }), 'two-route', 'frozen health');
  check(changed(twoRoute, (spec) => { spec.paths['/v1/chat/intake-preview'].post.operationId = 'changed'; }), 'two-route', 'deterministic intake');
  check(changed(twoRoute, (spec) => { spec.components.schemas.IntakePayload.properties.description.type = 'number'; }), 'two-route', 'frozen health and intake schemas');
  check(changed(reviewedFive, (spec) => { spec.paths['/health'].get.operationId = 'changed'; }), 'reviewed-five', 'frozen health');
  check(changed(reviewedFive, (spec) => { spec.components.schemas.IntakePayload.properties.description.type = 'number'; }), 'reviewed-five', 'frozen health and intake schemas');
  check(changed(reviewedFive, (spec) => { spec.paths['/projects'].get.operationId = 'changed'; }), 'reviewed-five', 'project list');
  check(changed(reviewedFive, (spec) => { spec.paths['/projects/{project_id}'].get.responses['200'].content['application/json'].schema.$ref = '#/components/schemas/HealthResponse'; }), 'reviewed-five', 'project read');
  check(changed(reviewedFive, (spec) => { spec.paths['/v1/projects/{projectId}/scope-review-preview'].post.security = []; }), 'reviewed-five', 'authenticated scope preview');
  check(changed(reviewedFive, (spec) => { spec.paths['/v1/projects/{projectId}/scope-review-preview'].post.parameters[1].schema.maxLength = 101; }), 'reviewed-five', 'authenticated scope preview');
  check(changed(reviewedFive, (spec) => { spec.components.schemas.PreviewResponse.properties.persisted.const = true; }), 'reviewed-five', 'scope preview schemas');
  check(changed(reviewedFive, (spec) => { spec.paths['/unexpected'] = { get: {} }; }), 'reviewed-five', 'phase paths');
  process.stdout.write('Two reviewed phases and structural drift cases passed.\n');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
