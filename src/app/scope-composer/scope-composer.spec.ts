import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Home } from '../app';
import { SCOPE_REVIEW_RUNTIME, ScopeComposer, ScopeReviewRuntime } from './scope-composer';

const projectId = '00000000-0000-0000-0000-000000000021';
const editor = { kind: 'authenticated-project-editor' as const, projectId, bearerToken: 'synthetic-token' };
const response = {
  schemaVersion: 'scope-review-preview.v1', projectId, state: 'pending_review',
  requestedQuantity: 4, question: '¿Cuántos puntos requieren PoE?',
  evidenceIds: ['EV-CAM-POE', 'EV-POOL-CAM'],
  proposal: { status: 'insufficient_stock', availableQuantity: 2 },
  reviewRequired: true, persisted: false, commercialReady: false,
};

function event(): Event {
  return { preventDefault: vi.fn() } as unknown as Event;
}

describe('local scope composer', () => {
  it('is absent by default and cannot issue a preview request', async () => {
    await TestBed.configureTestingModule({ imports: [Home] }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-scope-composer')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('mounts from the home entry only when a runtime adapter is explicitly provided', async () => {
    const fetcher = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: SCOPE_REVIEW_RUNTIME, useValue: {
        baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: async () => editor, fetcher,
      } satisfies ScopeReviewRuntime }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-scope-composer')).not.toBeNull();
    expect(page.querySelector('.empty-state')).toBeNull();
    expect(page.querySelector('#workspace-title')?.textContent).toContain('Conversación de alcance');
    expect(fetcher).not.toHaveBeenCalled();
  });

  async function mount(runtime: ScopeReviewRuntime) {
    await TestBed.configureTestingModule({
      imports: [ScopeComposer], providers: [{ provide: SCOPE_REVIEW_RUNTIME, useValue: runtime }],
    }).compileComponents();
    const fixture = TestBed.createComponent(ScopeComposer);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('requires an editor context from the injected session adapter', async () => {
    const fetcher = vi.fn();
    const editorContext = vi.fn().mockResolvedValue(null);
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: editorContext, fetcher });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await composer.submit(event());
    expect(fetcher).not.toHaveBeenCalled();
    expect(composer.ready()).toBe(false);
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBe(true);
  });

  it('rechecks a revoked editor context immediately before submission', async () => {
    const fetcher = vi.fn();
    const editorContext = vi.fn().mockResolvedValueOnce(editor).mockResolvedValueOnce(null);
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: editorContext, fetcher });
    const composer = fixture.componentInstance;
    expect(composer.ready()).toBe(true);
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await composer.submit(event());
    expect(fetcher).not.toHaveBeenCalled();
    expect(composer.ready()).toBe(false);
    expect(composer.result()).toBeNull();
  });

  it('renders only confirmed pending review text with a nonempty question', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: async () => editor, fetcher });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await composer.submit(event());
    fixture.detectChanges();
    const [url, options] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe(`/v1/projects/${projectId}/scope-review-preview`);
    expect(options.headers).toMatchObject({ authorization: 'Bearer synthetic-token' });
    expect(composer.result()?.question).toBe(response.question);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain(response.question);
    expect(text).toContain('EV-CAM-POE');
    expect(text).toContain('No persistido');
    expect(text).toContain('Sin aprobación comercial');
  });

  it('blocks a concurrent request and reuses the idempotency key after quota or service failure', async () => {
    let release!: (value: Response) => void;
    const first = new Promise<Response>((resolve) => { release = resolve; });
    const fetcher = vi.fn().mockReturnValueOnce(first)
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 200 }));
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: async () => editor, fetcher });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    const pending = composer.submit(event());
    await Promise.resolve();
    expect(composer.busy()).toBe(true);
    await composer.submit(event());
    expect(fetcher).toHaveBeenCalledTimes(1);
    release(new Response(null, { status: 429 }));
    await pending;
    expect(composer.error()).toContain('límite');
    await composer.submit(event());
    expect(composer.error()).toContain('no está disponible');
    await composer.submit(event());
    expect(composer.result()?.state).toBe('pending_review');
    const keys = fetcher.mock.calls.map(([, options]) => (options.headers as Record<string, string>)['idempotency-key']);
    expect(new Set(keys).size).toBe(1);
    composer.changeDraft({ target: { value: 'Five cameras' } } as unknown as Event);
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 200 }));
    await composer.submit(event());
    const changedKey = (fetcher.mock.calls[3][1].headers as Record<string, string>)['idempotency-key'];
    expect(changedKey).not.toBe(keys[0]);
  });

  it.each([401, 403, 404])('clears results and blocks another call after HTTP %i', async (status) => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status }));
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: async () => editor, fetcher });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await composer.submit(event());
    expect(composer.result()).not.toBeNull();
    await composer.submit(event());
    expect(composer.result()).toBeNull();
    expect(composer.ready()).toBe(false);
    await composer.submit(event());
    expect(fetcher).toHaveBeenCalledTimes(2);
    if (status === 404) expect(composer.error()).toContain('recurso no está disponible');
  });

  it('does not render arbitrary response text as HTML', async () => {
    const unsafe = { ...response, question: '<img src=x onerror=alert(1)>' };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(unsafe), { status: 200 }));
    const fixture = await mount({ baseUrl: 'https://api.example.invalid', contextVersion: signal(0), editor: async () => editor, fetcher });
    fixture.componentInstance.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await fixture.componentInstance.submit(event());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.result img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.result').textContent).toContain(unsafe.question);
  });

  it('clears a prior result when the trusted adapter changes account or project', async () => {
    const contextVersion = signal(0);
    const otherProject = '00000000-0000-0000-0000-000000000022';
    let activeEditor = editor;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...response, projectId: otherProject, question: '¿Dónde irá el segundo proyecto?',
      }), { status: 200 }));
    const fixture = await mount({
      baseUrl: 'https://api.example.invalid', contextVersion,
      editor: async () => activeEditor, fetcher,
    });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    await composer.submit(event());
    expect(composer.result()?.projectId).toBe(projectId);

    activeEditor = { ...editor, projectId: otherProject, bearerToken: 'second-synthetic-token' };
    contextVersion.update((version) => version + 1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(composer.result()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(response.question);

    await composer.submit(event());
    expect(composer.result()?.projectId).toBe(otherProject);
    const [url, options] = fetcher.mock.calls[1] as [URL, RequestInit];
    expect(url.pathname).toContain(otherProject);
    expect(options.headers).toMatchObject({ authorization: 'Bearer second-synthetic-token' });
  });

  it('discards a late response from a previous project context', async () => {
    const contextVersion = signal(0);
    let release!: (value: Response) => void;
    const pendingResponse = new Promise<Response>((resolve) => { release = resolve; });
    const fetcher = vi.fn().mockReturnValue(pendingResponse);
    const fixture = await mount({
      baseUrl: 'https://api.example.invalid', contextVersion,
      editor: async () => editor, fetcher,
    });
    const composer = fixture.componentInstance;
    composer.changeDraft({ target: { value: 'Four cameras' } } as unknown as Event);
    const pending = composer.submit(event());
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(1);
    contextVersion.update((version) => version + 1);
    release(new Response(JSON.stringify(response), { status: 200 }));
    await pending;
    await fixture.whenStable();
    expect(composer.result()).toBeNull();
  });
});
