import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import sourceFixture from '../../../public/fixtures/at248-review.v1.json';
import { FIXTURE_URL, parseReviewFixture } from './review-fixture';
import { ReviewPreview } from './review';

describe('local synthetic scope review', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the exported requested, proposed, and pending distinctions without a mutation', async () => {
    const fixture = TestBed.createComponent(ReviewPreview);
    fixture.detectChanges();
    const request = http.expectOne(FIXTURE_URL);
    expect(request.request.method).toBe('GET');
    expect(fixture.nativeElement.textContent).toContain('Cargando la fixture local');
    request.flush(sourceFixture);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Solicitado');
    });
    expect(fixture.nativeElement.textContent).toContain('Propuesto para revisión');
    expect(fixture.nativeElement.textContent).toContain('Evidencia de capacidad: no disponible');
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(3);
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pendiente de medición');
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cambio a 10');
    expect(fixture.nativeElement.textContent).toContain('document_missing');
    expect(http.match(() => true)).toHaveLength(0);
  });

  it('rejects invalid versions, counts, extra fields, and unsupported approval states', () => {
    expect(() => parseReviewFixture({ ...sourceFixture, wireVersion: 'other' })).toThrow();
    const wrongCount = structuredClone(sourceFixture) as unknown as Record<string, unknown>;
    const cases = wrongCount['cases'] as Record<string, Record<string, unknown>>;
    (cases['eight']['lines'] as { quantity: number | null }[])[0].quantity = 9;
    expect(() => parseReviewFixture(wrongCount)).toThrow();
    expect(() => parseReviewFixture({ ...sourceFixture, confirm: true })).toThrow();
    const approval = structuredClone(sourceFixture) as unknown as Record<string, unknown>;
    const approvalCases = approval['cases'] as Record<string, Record<string, unknown>>;
    (approvalCases['eight']['lines'] as { state: string }[])[0].state = 'user_approved';
    expect(() => parseReviewFixture(approval)).toThrow();
  });

  it('fails closed when the static asset is unavailable', async () => {
    const fixture = TestBed.createComponent(ReviewPreview);
    fixture.detectChanges();
    http.expectOne(FIXTURE_URL).flush('missing', { status: 404, statusText: 'Not Found' });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
        'fixture local falta',
      );
    });
    expect(fixture.nativeElement.querySelectorAll('.lines li')).toHaveLength(0);
  });
});
