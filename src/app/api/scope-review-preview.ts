// Isolated client for the reviewed public API PR #39 artifact. No app route calls this client.
export type AuthenticatedProjectEditor = Readonly<{
  kind: 'authenticated-project-editor';
  projectId: string;
  bearerToken: string;
}>;

export type ScopeReviewPreview = Readonly<{
  schemaVersion: 'scope-review-preview.v1';
  projectId: string;
  state: 'pending_review';
  requestedQuantity: number;
  question: string;
  evidenceIds: string[];
  proposal: { status: 'insufficient_stock' | 'needs_review'; availableQuantity?: number | null };
  reviewRequired: true;
  persisted: false;
  commercialReady: false;
}>;

export type ScopeReviewFailure =
  | 'invalid_input'
  | 'invalid_response'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'limited'
  | 'offline'
  | 'unavailable';

export class ScopeReviewPreviewError extends Error {
  constructor(readonly code: ScopeReviewFailure) {
    super(code);
    this.name = 'ScopeReviewPreviewError';
  }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const key = /^[A-Za-z0-9._:-]{1,100}$/;
const token = /^[A-Za-z0-9._~-]+$/;
const own = (value: object, field: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, field);

function record(
  value: unknown,
  required: readonly string[],
  optional: readonly string[] = [],
): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    return null;
  const data = value as Record<string, unknown>;
  if (required.some((field) => !own(data, field)) ||
    Object.keys(data).some((field) => !required.includes(field) && !optional.includes(field)))
    return null;
  return data;
}

export function parseScopeReviewPreview(value: unknown, projectId: string): ScopeReviewPreview {
  const data = record(value, [
    'schemaVersion', 'projectId', 'state', 'requestedQuantity', 'question', 'evidenceIds',
    'proposal', 'reviewRequired', 'persisted', 'commercialReady',
  ]);
  const proposal = record(data?.['proposal'], ['status'], ['availableQuantity']);
  if (
    !data || !proposal ||
    data['schemaVersion'] !== 'scope-review-preview.v1' ||
    typeof data['projectId'] !== 'string' || !uuid.test(data['projectId']) ||
    data['projectId'].toLowerCase() !== projectId.toLowerCase() ||
    data['state'] !== 'pending_review' ||
    !Number.isSafeInteger(data['requestedQuantity']) || (data['requestedQuantity'] as number) < 1 ||
    typeof data['question'] !== 'string' || !data['question'].trim() ||
    !Array.isArray(data['evidenceIds']) ||
    !data['evidenceIds'].every((id: unknown) => typeof id === 'string') ||
    (proposal['status'] !== 'insufficient_stock' && proposal['status'] !== 'needs_review') ||
    (own(proposal, 'availableQuantity') && proposal['availableQuantity'] !== null &&
      (!Number.isSafeInteger(proposal['availableQuantity']) ||
        (proposal['availableQuantity'] as number) < 0)) ||
    data['reviewRequired'] !== true || data['persisted'] !== false ||
    data['commercialReady'] !== false
  ) {
    throw new ScopeReviewPreviewError('invalid_response');
  }
  return data as ScopeReviewPreview;
}

function failureForStatus(status: number): ScopeReviewFailure {
  switch (status) {
    case 401: return 'unauthorized';
    case 403: return 'forbidden';
    // Deliberately identical for a missing project and revoked membership.
    case 404: return 'not_found';
    case 409: return 'conflict';
    case 422: return 'invalid_input';
    case 429: return 'limited';
    default: return 'unavailable';
  }
}

export async function previewScopeReview(
  baseUrl: string,
  permission: AuthenticatedProjectEditor,
  brief: string,
  idempotencyKey: string,
  fetcher: typeof fetch,
): Promise<ScopeReviewPreview> {
  if (
    permission?.kind !== 'authenticated-project-editor' ||
    !uuid.test(permission.projectId) ||
    !token.test(permission.bearerToken) ||
    !key.test(idempotencyKey) ||
    typeof brief !== 'string' || !brief.trim() || [...brief].length > 4000
  ) {
    throw new ScopeReviewPreviewError('invalid_input');
  }
  let url: URL;
  try {
    url = new URL(`/v1/projects/${permission.projectId}/scope-review-preview`, baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocol');
  } catch {
    throw new ScopeReviewPreviewError('invalid_input');
  }
  let response: Response;
  try {
    response = await fetcher(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${permission.bearerToken}`,
        'idempotency-key': idempotencyKey,
      },
      credentials: 'omit',
      body: JSON.stringify({ brief }),
    });
  } catch {
    throw new ScopeReviewPreviewError('offline');
  }
  if (!response.ok) throw new ScopeReviewPreviewError(failureForStatus(response.status));
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ScopeReviewPreviewError('invalid_response');
  }
  return parseScopeReviewPreview(body, permission.projectId);
}
