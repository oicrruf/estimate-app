import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('contracts/openapi.json');
const output = resolve('src/app/api/health.generated.ts');
const spec = JSON.parse(readFileSync(source, 'utf8'));
const methods = Object.keys(spec.paths ?? {});
const health = spec.paths?.['/health'];
const response = health?.get?.responses?.['200'];
const schemaRef = response?.content?.['application/json']?.schema?.$ref;
const schema = spec.components?.schemas?.HealthResponse;
if (spec.openapi !== '3.1.0' || spec.info?.version !== '0.1.0' || methods.length !== 1 || methods[0] !== '/health' || Object.keys(health).length !== 1 || health.get.operationId !== 'health' || Object.keys(health.get.responses).length !== 1 || schemaRef !== '#/components/schemas/HealthResponse' || schema?.type !== 'object' || schema.properties?.status?.const !== 'ok' || schema.properties.status.type !== 'string') {
  throw new Error('AT-207 supports only the frozen GET /health contract');
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
