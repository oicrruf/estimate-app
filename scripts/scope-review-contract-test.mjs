import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Public estimate-api PR #39, commit 17d5ad5746e423844a885415d7ba804a321e00b7.
const reviewedHash = '0f13af69dfac409072b66a3d75e940c9bc7ea9970ac5788c0fbf1cc1edd8bcf9';
const bytes = readFileSync(resolve('tests/fixtures/at209-scope-review-openapi.json'));
const assertReviewedBytes = (contents) =>
  assert.equal(createHash('sha256').update(contents).digest('hex'), reviewedHash);
assertReviewedBytes(bytes);
assert.throws(() => assertReviewedBytes(Buffer.concat([bytes, Buffer.from(' ')])));

const spec = JSON.parse(bytes.toString('utf8'));
const operation = spec.paths?.['/v1/projects/{projectId}/scope-review-preview']?.post;
const parameters = operation?.parameters ?? [];
const schema = spec.components?.schemas;
assert.equal(spec.openapi, '3.1.0');
assert.equal(operation?.operationId, 'previewScopeReviewV1');
assert.deepEqual(operation?.security, [{ HTTPBearer: [] }]);
assert.ok(spec.components?.securitySchemes?.HTTPBearer);
assert.ok(parameters.some((item) => item.name === 'projectId' && item.in === 'path' && item.required === true && item.schema?.format === 'uuid'));
assert.ok(parameters.some((item) => item.name === 'Idempotency-Key' && item.in === 'header' && item.required === true && item.schema?.minLength === 1 && item.schema?.maxLength === 100));
assert.equal(operation?.requestBody?.content?.['application/json']?.schema?.$ref, '#/components/schemas/PreviewRequest');
assert.equal(operation?.responses?.['200']?.content?.['application/json']?.schema?.$ref, '#/components/schemas/PreviewResponse');
for (const status of ['401', '403', '404', '409', '422', '429', '503']) {
  assert.ok(operation.responses[status], `Missing ${status} response`);
}
assert.equal(schema?.PreviewRequest?.properties?.brief?.minLength, 1);
assert.equal(schema?.PreviewRequest?.properties?.brief?.maxLength, 4000);
assert.deepEqual(schema?.PreviewRequest?.required, ['brief']);
assert.equal(schema?.PreviewResponse?.properties?.schemaVersion?.const, 'scope-review-preview.v1');
assert.equal(schema?.PreviewResponse?.properties?.state?.const, 'pending_review');
assert.equal(schema?.PreviewResponse?.properties?.reviewRequired?.const, true);
assert.equal(schema?.PreviewResponse?.properties?.persisted?.const, false);
assert.equal(schema?.PreviewResponse?.properties?.commercialReady?.const, false);
assert.equal(schema?.PreviewResponse?.properties?.question?.minLength, 1);
assert.equal(schema?.PreviewResponse?.properties?.question?.type, 'string');
assert.deepEqual(schema?.PreviewProposal?.properties?.status?.enum, ['insufficient_stock', 'needs_review']);

process.stdout.write('Pinned scope review draft contract verified.\n');
