import {
  AuthenticatedProjectEditor,
  parseScopeReviewPreview,
  previewScopeReview,
  ScopeReviewPreviewError,
} from './scope-review-preview';

const projectId = '00000000-0000-0000-0000-000000000021';
const permission: AuthenticatedProjectEditor = {
  kind: 'authenticated-project-editor',
  projectId,
  bearerToken: 'synthetic-token',
};
const safe = {
  schemaVersion: 'scope-review-preview.v1',
  projectId,
  state: 'pending_review',
  requestedQuantity: 4,
  question: 'Confirm stock before quoting.',
  evidenceIds: ['EV-CAM-POE', 'EV-POOL-CAM'],
  proposal: { status: 'insufficient_stock', availableQuantity: 2 },
  reviewRequired: true,
  persisted: false,
  commercialReady: false,
};

describe('isolated authenticated scope review contract', () => {
  it('sends only a synthetic request through the injected transport', async () => {
    const fetcher = vi.fn(async (_url: URL, _options?: RequestInit) =>
      new Response(JSON.stringify(safe), { status: 200 }));
    const result = await previewScopeReview(
      'https://api.example.invalid', permission, 'Four synthetic cameras', 'synthetic-key',
      fetcher as typeof fetch,
    );
    expect(result.proposal.availableQuantity).toBe(2);
    const [url, options] = fetcher.mock.calls[0];
    expect(url.pathname).toBe(`/v1/projects/${projectId}/scope-review-preview`);
    expect(options?.method).toBe('POST');
    expect(options?.credentials).toBe('omit');
    expect(options?.headers).toEqual({
      'content-type': 'application/json',
      authorization: 'Bearer synthetic-token',
      'idempotency-key': 'synthetic-key',
    });
    expect(JSON.parse(String(options?.body))).toEqual({ brief: 'Four synthetic cameras' });
  });

  it('rejects invalid permission, key, and brief before transport', async () => {
    const fetcher = vi.fn();
    await expect(previewScopeReview('https://api.example.invalid', {
      ...permission, kind: 'viewer' as 'authenticated-project-editor',
    }, 'Synthetic', 'key', fetcher as typeof fetch)).rejects.toMatchObject({ code: 'invalid_input' });
    await expect(previewScopeReview('https://api.example.invalid', permission, ' ', 'key', fetcher as typeof fetch)).rejects.toMatchObject({ code: 'invalid_input' });
    await expect(previewScopeReview('https://api.example.invalid', permission, '📷'.repeat(4001), 'key', fetcher as typeof fetch)).rejects.toMatchObject({ code: 'invalid_input' });
    await expect(previewScopeReview('https://api.example.invalid', permission, 'Synthetic', 'bad key', fetcher as typeof fetch)).rejects.toMatchObject({ code: 'invalid_input' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects unsafe, cross-project, unknown, and inherited response data', () => {
    expect(() => parseScopeReviewPreview(safe, projectId)).not.toThrow();
    for (const changed of [
      { ...safe, persisted: true },
      { ...safe, commercialReady: true },
      { ...safe, reviewRequired: false },
      { ...safe, projectId: '00000000-0000-0000-0000-000000000022' },
      { ...safe, question: null },
      { ...safe, extra: '<script>' },
      { ...safe, proposal: { ...safe.proposal, status: 'approved' } },
    ]) {
      expect(() => parseScopeReviewPreview(changed, projectId)).toThrow(ScopeReviewPreviewError);
    }
    const inherited = Object.assign(Object.create({ projectId }), safe);
    expect(() => parseScopeReviewPreview(inherited, projectId)).toThrow(ScopeReviewPreviewError);
  });

  it('preserves an omitted quantity and accepts null or nonnegative integers', () => {
    const omitted = parseScopeReviewPreview(
      { ...safe, proposal: { status: 'needs_review' } }, projectId,
    );
    expect(Object.hasOwn(omitted.proposal, 'availableQuantity')).toBe(false);
    expect(omitted.proposal.availableQuantity).toBeUndefined();
    expect(parseScopeReviewPreview(
      { ...safe, proposal: { status: 'needs_review', availableQuantity: null } }, projectId,
    ).proposal.availableQuantity).toBeNull();
    for (const amount of [0, 2]) {
      expect(parseScopeReviewPreview(
        { ...safe, proposal: { status: 'insufficient_stock', availableQuantity: amount } },
        projectId,
      ).proposal.availableQuantity).toBe(amount);
    }
  });

  it('rejects invalid present quantities and unknown proposal fields', () => {
    for (const amount of [-1, 1.5, '2', undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => parseScopeReviewPreview(
        { ...safe, proposal: { status: 'needs_review', availableQuantity: amount } }, projectId,
      )).toThrow(ScopeReviewPreviewError);
    }
    expect(() => parseScopeReviewPreview(
      { ...safe, proposal: { status: 'needs_review', unexpected: 2 } }, projectId,
    )).toThrow(ScopeReviewPreviewError);
  });

  it.each([
    [401, 'unauthorized'], [403, 'forbidden'], [404, 'not_found'], [409, 'conflict'],
    [422, 'invalid_input'], [429, 'limited'], [503, 'unavailable'],
  ])('maps HTTP %i to bounded %s without reading body', async (status, code) => {
    const fetcher = vi.fn(async () => new Response('private detail', { status }));
    await expect(previewScopeReview(
      'https://api.example.invalid', permission, 'Synthetic', 'key', fetcher as typeof fetch,
    )).rejects.toMatchObject({ code });
  });

  it('handles a disconnected transport and malformed success without leaking data', async () => {
    const disconnected = vi.fn(async () => { throw new Error('private network detail'); });
    await expect(previewScopeReview(
      'https://api.example.invalid', permission, 'Synthetic', 'key', disconnected as typeof fetch,
    )).rejects.toMatchObject({ code: 'offline', message: 'offline' });
    const malformed = vi.fn(async () => new Response('{', { status: 200 }));
    await expect(previewScopeReview(
      'https://api.example.invalid', permission, 'Synthetic', 'key', malformed as typeof fetch,
    )).rejects.toMatchObject({ code: 'invalid_response' });
  });
});
