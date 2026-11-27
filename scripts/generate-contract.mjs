import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('contracts/openapi.json');
const output = resolve('src/app/api/health.generated.ts');
const bytes = readFileSync(source);
const digest = (value) => createHash('sha256').update(value).digest('hex');
const currentHash = '86b72b468097253a178c8cf33d09f6ef2b10196943b46a623fca2eea0436ac06';
const reviewedFiveHash = '0f13af69dfac409072b66a3d75e940c9bc7ea9970ac5788c0fbf1cc1edd8bcf9';
const phase = digest(bytes) === currentHash ? 'current' : digest(bytes) === reviewedFiveHash ? 'reviewed-five' : null;
if (!phase) throw new Error('Canonical OpenAPI bytes are not a reviewed phase');
const spec = JSON.parse(bytes.toString('utf8'));
const health = spec.paths?.['/health'];
const preview = spec.paths?.['/v1/chat/intake-preview'];
const schemas = spec.components?.schemas ?? {};
const exactKeys = (value, expected) => value && Object.keys(value).sort().join('|') === [...expected].sort().join('|');
const exactValues = (value, expected) => Array.isArray(value) && value.length === expected.length && [...value].sort().join('|') === [...expected].sort().join('|');
const ref = (operation, status) => operation?.responses?.[status]?.content?.['application/json']?.schema?.$ref;
const requestRef = (operation) => operation?.requestBody?.content?.['application/json']?.schema?.$ref;
const bearer = (operation) => JSON.stringify(operation?.security) === '[{"HTTPBearer":[]}]';
const parameter = (operation, name, location) => operation?.parameters?.find((item) => item.name === name && item.in === location);
const requireShape = (condition, label) => { if (!condition) throw new Error(`Unexpected ${label} contract`); };

const expectedPaths = phase === 'current'
  ? ['/health', '/v1/chat/intake-preview']
  : ['/health', '/projects', '/projects/{project_id}', '/v1/chat/intake-preview', '/v1/projects/{projectId}/scope-review-preview'];
requireShape(spec.openapi === '3.1.0' && spec.info?.version === '0.1.0' && exactKeys(spec.paths, expectedPaths), 'phase paths');
requireShape(exactKeys(health, ['get']) && health.get.operationId === 'health' && exactKeys(health.get.responses, ['200']) && ref(health.get, '200') === '#/components/schemas/HealthResponse' && schemas.HealthResponse?.properties?.status?.const === 'ok', 'frozen health');
requireShape(exactKeys(preview, ['post']) && preview.post.operationId === 'previewChatIntake' && requestRef(preview.post) === '#/components/schemas/IntakePreviewRequest' && ref(preview.post, '200') === '#/components/schemas/IntakePreviewResponse' && exactKeys(preview.post.responses, ['200', '422']), 'deterministic intake');

const futureSchemas = new Set(['ProjectPage', 'ProjectView', 'PreviewRequest', 'PreviewResponse', 'PreviewProposal']);
const frozen = {
  health,
  intake: preview,
  schemas: Object.fromEntries(Object.entries(schemas).filter(([name]) => !futureSchemas.has(name)).sort(([a], [b]) => a.localeCompare(b))),
};
requireShape(digest(JSON.stringify(frozen)) === '8d7d12747853188b6fd2e10ded52a8bc7738bc09a2dc52b86ec7b677e15d3007', 'frozen health and intake schemas');

if (phase === 'reviewed-five') {
  const security = spec.components?.securitySchemes?.HTTPBearer;
  requireShape(security?.type === 'http' && security.scheme === 'bearer', 'Bearer scheme');
  const list = spec.paths['/projects'];
  const listGet = list?.get;
  const limit = parameter(listGet, 'limit', 'query');
  const cursor = parameter(listGet, 'cursor', 'query');
  requireShape(exactKeys(list, ['get']) && listGet.operationId === 'listProjects' && bearer(listGet) && listGet.parameters?.length === 2 && limit?.required === false && limit.schema?.type === 'integer' && limit.schema.minimum === 1 && limit.schema.maximum === 100 && cursor?.required === false && cursor.schema?.anyOf?.some((entry) => entry.format === 'uuid') && cursor.schema.anyOf.some((entry) => entry.type === 'null') && exactKeys(listGet.responses, ['200', '401', '403', '422', '503']) && ref(listGet, '200') === '#/components/schemas/ProjectPage', 'project list');
  const page = schemas.ProjectPage;
  requireShape(page?.type === 'object' && exactValues(page.required, ['items', 'next_cursor']) && page.properties?.items?.items?.$ref === '#/components/schemas/ProjectView', 'project page');
  const read = spec.paths['/projects/{project_id}'];
  const readGet = read?.get;
  const readId = parameter(readGet, 'project_id', 'path');
  requireShape(exactKeys(read, ['get']) && readGet.operationId === 'getProject' && bearer(readGet) && readGet.parameters?.length === 1 && readId?.required === true && readId.schema?.format === 'uuid' && exactKeys(readGet.responses, ['200', '401', '403', '404', '422', '503']) && ref(readGet, '200') === '#/components/schemas/ProjectView', 'project read');
  const view = schemas.ProjectView;
  requireShape(view?.type === 'object' && exactValues(view.required, ['id', 'name', 'revision', 'access_role']) && view.properties?.id?.format === 'uuid' && view.properties?.revision?.type === 'integer' && exactValues(view.properties?.access_role?.enum, ['owner', 'editor', 'viewer']), 'project view');
  const scope = spec.paths['/v1/projects/{projectId}/scope-review-preview'];
  const scopePost = scope?.post;
  const scopeId = parameter(scopePost, 'projectId', 'path');
  const key = parameter(scopePost, 'Idempotency-Key', 'header');
  requireShape(exactKeys(scope, ['post']) && scopePost.operationId === 'previewScopeReviewV1' && bearer(scopePost) && scopePost.parameters?.length === 2 && scopeId?.required === true && scopeId.schema?.format === 'uuid' && key?.required === true && key.schema?.minLength === 1 && key.schema.maxLength === 100 && requestRef(scopePost) === '#/components/schemas/PreviewRequest' && exactKeys(scopePost.responses, ['200', '401', '403', '404', '409', '422', '429', '503']) && ref(scopePost, '200') === '#/components/schemas/PreviewResponse', 'authenticated scope preview');
  const request = schemas.PreviewRequest;
  const result = schemas.PreviewResponse;
  const proposal = schemas.PreviewProposal;
  requireShape(exactValues(request?.required, ['brief']) && request.properties?.brief?.type === 'string' && request.properties.brief.minLength === 1 && request.properties.brief.maxLength === 4000 && result?.properties?.schemaVersion?.const === 'scope-review-preview.v1' && result.properties.state?.const === 'pending_review' && result.properties.reviewRequired?.const === true && result.properties.persisted?.const === false && result.properties.commercialReady?.const === false && result.properties.question?.type === 'string' && result.properties.question.minLength === 1 && result.properties.proposal?.$ref === '#/components/schemas/PreviewProposal' && exactValues(proposal?.properties?.status?.enum, ['insufficient_stock', 'needs_review']), 'scope preview schemas');
}
const generated = `// Generated from contracts/openapi.json. Do not edit by hand.\nexport type HealthResponse = { status: 'ok' };\n\nexport async function health(baseUrl: string, fetcher: typeof fetch = fetch): Promise<HealthResponse> {\n  const response = await fetcher(new URL('/health', baseUrl));\n  if (!response.ok) throw new Error(\`Health request failed: \${response.status}\`);\n  const body: unknown = await response.json();\n  if (typeof body !== 'object' || body === null || Array.isArray(body) || Object.keys(body).length !== 1 || !('status' in body) || body.status !== 'ok') {\n    throw new Error('Invalid health response');\n  }\n  return { status: 'ok' };\n}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== generated) throw new Error('Generated health client is stale');
  const apiExportArg = process.argv.indexOf('--api-export');
  if (apiExportArg !== -1) {
    const external = JSON.parse(readFileSync(resolve(process.argv[apiExportArg + 1]), 'utf8'));
    const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sorted(v)])) : value;
    if (JSON.stringify(sorted(external)) !== JSON.stringify(sorted(spec))) throw new Error('Canonical API export differs from tracked reference');
  }
} else {
  writeFileSync(output, generated);
}
