import { Intake, parseIntakePreview, previewChatIntake } from './intake-preview.generated';

const safe = {
  stage: 'scope_review_pending',
  review_required: true,
  persisted: false,
  project_id: null,
  proposed_purchase_items: [],
  draft: {
    description: 'Synthetic camera request',
    contract_version: 'intake.v1',
    blocking_questions: [],
  },
};

describe('generated read-only intake preview', () => {
  it('accepts a bounded pending review without persistence', () => {
    expect(parseIntakePreview(safe).draft.description).toBe('Synthetic camera request');
  });

  it('rejects drift, extra fields, and unsafe approval state', () => {
    expect(() => parseIntakePreview({ ...safe, persisted: true })).toThrow();
    expect(() => parseIntakePreview({ ...safe, project_id: 'project-1' })).toThrow();
    expect(() => parseIntakePreview({ ...safe, extra: 'unreviewed' })).toThrow();
    expect(() => parseIntakePreview({ ...safe, stage: undefined })).toThrow();
    expect(() =>
      parseIntakePreview({ ...safe, draft: { ...safe.draft, unknown: '<script>' } }),
    ).toThrow();
  });

  it('posts only a validated synthetic intake and omits credentials', async () => {
    const fetcher = vi.fn(
      async (_url: URL, _init?: RequestInit) => new Response(JSON.stringify(safe), { status: 200 }),
    );
    const response = await previewChatIntake(
      'http://127.0.0.1:8000',
      { description: 'Synthetic camera request' },
      fetcher as typeof fetch,
    );
    expect(response.persisted).toBe(false);
    const [url, init] = fetcher.mock.calls[0];
    expect(url.pathname).toBe('/v1/chat/intake-preview');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('omit');
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: 'create_project',
      intake: { description: 'Synthetic camera request' },
    });
  });

  it('rejects invalid input before fetch', async () => {
    const fetcher = vi.fn();
    await expect(
      previewChatIntake('http://127.0.0.1:8000', { description: '' }, fetcher as typeof fetch),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('omits recognized optional undefined fields at every object level', async () => {
    const fetcher = vi.fn(
      async (_url: URL, _init?: RequestInit) => new Response(JSON.stringify(safe), { status: 200 }),
    );
    const intake: Intake = {
      description: 'Synthetic request',
      objective: undefined,
      location: { value: 'Example site', certainty: 'confirmed', evidence: undefined },
      client_assets: [
        {
          name: 'Example camera',
          availability: 'unknown',
          validation: 'unknown',
          evidence: undefined,
        },
      ],
    };
    await previewChatIntake('http://127.0.0.1:8000', intake, fetcher as typeof fetch);
    const sent = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(sent.intake).toEqual({
      description: 'Synthetic request',
      location: { value: 'Example site', certainty: 'confirmed' },
      client_assets: [{ name: 'Example camera', availability: 'unknown', validation: 'unknown' }],
    });
  });

  it('still rejects missing required and unknown fields, even when undefined', async () => {
    const fetcher = vi.fn();
    await expect(
      previewChatIntake(
        'http://127.0.0.1:8000',
        { description: undefined } as unknown as Intake,
        fetcher as typeof fetch,
      ),
    ).rejects.toThrow();
    await expect(
      previewChatIntake(
        'http://127.0.0.1:8000',
        { description: 'Synthetic', unknown: undefined } as Intake,
        fetcher as typeof fetch,
      ),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('counts supplementary Unicode as code points at the 4000-character bound', async () => {
    const fetcher = vi.fn(
      async (_url: URL, _init?: RequestInit) => new Response(JSON.stringify(safe), { status: 200 }),
    );
    await previewChatIntake(
      'http://127.0.0.1:8000',
      { description: '📷'.repeat(2001) },
      fetcher as typeof fetch,
    );
    await expect(
      previewChatIntake(
        'http://127.0.0.1:8000',
        { description: '📷'.repeat(4001) },
        fetcher as typeof fetch,
      ),
    ).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
