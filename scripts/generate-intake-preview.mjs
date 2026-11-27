import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Public, tracked OpenAPI from estimate-api PR #37, commit cc481d3389e45a5aa9154baff7c947510589698c.
const expectedHash = '86b72b468097253a178c8cf33d09f6ef2b10196943b46a623fca2eea0436ac06';
const output = resolve('src/app/api/intake-preview.generated.ts');
const exportArg = process.argv.indexOf('--api-export');
if (exportArg < 0 || !process.argv[exportArg + 1])
  throw new Error('Pass --api-export <tracked preview OpenAPI file>');
const bytes = readFileSync(resolve(process.argv[exportArg + 1]));
if (createHash('sha256').update(bytes).digest('hex') !== expectedHash)
  throw new Error('Preview OpenAPI bytes differ from reviewed PR #37 artifact');
const spec = JSON.parse(bytes.toString('utf8'));
const endpoint = spec.paths?.['/v1/chat/intake-preview']?.post;
if (
  spec.openapi !== '3.1.0' ||
  Object.keys(spec.paths).sort().join('|') !== '/health|/v1/chat/intake-preview' ||
  endpoint?.operationId !== 'previewChatIntake' ||
  endpoint.requestBody?.content?.['application/json']?.schema?.$ref !==
    '#/components/schemas/IntakePreviewRequest' ||
  endpoint.responses?.['200']?.content?.['application/json']?.schema?.$ref !==
    '#/components/schemas/IntakePreviewResponse'
) {
  throw new Error('Unexpected intake preview operation');
}
const schemas = spec.components.schemas;
const generated = `// Generated from the public PR #37 OpenAPI artifact. Do not edit by hand.
// This preview client is separate from the approved canonical health contract.
const schemas: Record<string, Schema> = ${JSON.stringify(schemas, null, 2)};

type Schema = { [key: string]: unknown; $ref?: string; anyOf?: Schema[]; type?: string; enum?: unknown[]; const?: unknown; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: boolean; items?: Schema; minLength?: number; maxLength?: number };
export type Certainty = 'confirmed' | 'inferred';
export type Fact<T> = { value: T; certainty: Certainty; evidence?: string | null };
export type Measurement = { label: string; value: number; unit: string };
export type ClientAsset = { name: string; availability: 'available' | 'unavailable' | 'unknown'; validation: 'validated' | 'unvalidated' | 'unknown'; evidence?: string | null };
export type SupplyItem = { name: string; supplied_by: 'client' | 'contractor'; purchase_required?: boolean };
export type Intake = { description: string; objective?: Fact<string> | null; location?: Fact<string> | null; environment?: Fact<string> | null; sketch?: Fact<string> | null; measurements?: Fact<Measurement[]> | null; restrictions?: Fact<string[]> | null; exclusions?: Fact<string[]> | null; client_assets?: ClientAsset[]; client_assets_absence_evidence?: string | null; supplies?: SupplyItem[]; supplies_absence_evidence?: string | null };
export type IntakePreviewRequest = { operation: 'create_project'; intake: Intake };
export type BlockingQuestion = { field: string; text: string };
export type ScopeDraft = Intake & { contract_version: string; blocking_questions: BlockingQuestion[] };
export type IntakePreviewResponse = { draft: ScopeDraft; proposed_purchase_items: string[]; stage?: 'scope_review_pending'; review_required?: true; persisted?: false; project_id?: null };

function valid(schema: Schema, value: unknown): boolean {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    return schema.$ref === '#/components/schemas/' + name && schemas[name] !== undefined && valid(schemas[name], value);
  }
  if (schema.anyOf) return schema.anyOf.some((branch) => valid(branch, value));
  if (schema.const !== undefined && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === 'null') return value === null;
  if (schema.type === 'string') {
    if (typeof value !== 'string') return false;
    const length = [...value].length;
    return (schema.minLength === undefined || length >= schema.minLength) && (schema.maxLength === undefined || length <= schema.maxLength);
  }
  if (schema.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (schema.type === 'boolean') return typeof value === 'boolean';
  if (schema.type === 'array') return Array.isArray(value) && (schema.items === undefined || value.every((item) => valid(schema.items!, item)));
  if (schema.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const obj = value as Record<string, unknown>;
    if (schema.required?.some((key) => !(key in obj))) return false;
    if (schema.additionalProperties === false && Object.keys(obj).some((key) => !(key in (schema.properties ?? {})))) return false;
    return Object.entries(obj).every(([key, item]) => !schema.properties?.[key] || valid(schema.properties[key], item));
  }
  return false;
}

function omitOptionalUndefined(schema: Schema, value: unknown): unknown {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/components/schemas/', '');
    return schemas[name] ? omitOptionalUndefined(schemas[name], value) : value;
  }
  if (schema.anyOf) {
    const branch = schema.anyOf.find((item) => value === null ? item.type === 'null' : item.type !== 'null');
    return branch ? omitOptionalUndefined(branch, value) : value;
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items) return value.map((item) => omitOptionalUndefined(schema.items!, item));
  if (schema.type !== 'object' || value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(input).filter(([key, item]) => item !== undefined || !schema.properties?.[key] || schema.required?.includes(key)).map(([key, item]) => [key, schema.properties?.[key] ? omitOptionalUndefined(schema.properties[key], item) : item]));
}

export function parseIntakePreview(value: unknown): IntakePreviewResponse {
  if (!valid(schemas['IntakePreviewResponse'], value)) throw new Error('Invalid intake preview response');
  const response = value as IntakePreviewResponse;
  if (response.stage !== 'scope_review_pending' || response.review_required !== true || response.persisted !== false || response.project_id !== null) throw new Error('Unsafe intake preview state');
  return response;
}

export async function previewChatIntake(baseUrl: string, intake: Intake, fetcher: typeof fetch = fetch): Promise<IntakePreviewResponse> {
  const request = omitOptionalUndefined(schemas['IntakePreviewRequest'], { operation: 'create_project', intake }) as IntakePreviewRequest;
  if (!valid(schemas['IntakePreviewRequest'], request)) throw new Error('Invalid intake preview request');
  const response = await fetcher(new URL('/v1/chat/intake-preview', baseUrl), { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit', body: JSON.stringify(request) });
  if (!response.ok) throw new Error('Intake preview failed: ' + response.status);
  return parseIntakePreview(await response.json() as unknown);
}
`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== generated)
    throw new Error('Generated intake preview client is stale');
} else {
  writeFileSync(output, generated);
}
