import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DemoApi, DemoRequest, demoUrl, parseDemoEvaluation } from './demo-api';

const path = {
  nodes: [
    { id: 'SW-16', type: 'PRODUCT' },
    { id: 'CAP-POE', type: 'CAPABILITY' },
    { id: 'EV-POE', type: 'EVIDENCE', source: 'synthetic://spec' },
  ],
  relations: ['SUPPORTS', 'SUPPORTED_BY'],
};

function response(scenario: DemoRequest['scenario']) {
  const ups = scenario === 'ups';
  const productId = ups ? 'UPS-1500' : scenario === 'camera' ? 'CAM-POE' : 'SW-16';
  return {
    scenario,
    selectedProductId: ups ? null : productId,
    candidates: [
      {
        productId,
        status: ups ? 'TECHNICALLY_COMPATIBLE_NO_OFFER' : 'COMPATIBLE',
        reasonCodes: [ups ? 'MEETS_TECHNICAL_REQUIREMENT_NO_OFFER' : 'MEETS_REQUIREMENTS'],
        offerIds: ups ? [] : [`OFFER-${productId}`],
        evidencePaths: [path],
      },
    ],
  };
}

describe('DemoApi', () => {
  let api: DemoApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DemoApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses only the relevant query parameter on the same origin', async () => {
    const cases: DemoRequest[] = [
      { scenario: 'switch', poePortsMin: 12 },
      { scenario: 'camera', quantity: 2 },
      { scenario: 'ups' },
    ];
    expect(cases.map(demoUrl)).toEqual([
      '/v1/demo/evaluate?scenario=switch&poe_ports_min=12',
      '/v1/demo/evaluate?scenario=camera&quantity=2',
      '/v1/demo/evaluate?scenario=ups',
    ]);
    for (const request of cases) {
      const pending = api.evaluate(request);
      const call = http.expectOne(demoUrl(request));
      expect(call.request.method).toBe('GET');
      call.flush(response(request.scenario));
      expect((await pending).scenario).toBe(request.scenario);
    }
  });

  it('rejects mismatched, incomplete, and unbounded response data', () => {
    const request: DemoRequest = { scenario: 'switch', poePortsMin: 8 };
    expect(() => parseDemoEvaluation({ ...response('camera') }, request)).toThrow();
    expect(() => parseDemoEvaluation({ ...response('switch'), candidates: [] }, request)).toThrow();
    expect(() =>
      parseDemoEvaluation({ ...response('switch'), candidates: [{}] }, request),
    ).toThrow();
    expect(() =>
      parseDemoEvaluation(
        {
          ...response('switch'),
          candidates: [{ ...response('switch').candidates[0], productId: 'X'.repeat(121) }],
        },
        request,
      ),
    ).toThrow();
    expect(() =>
      parseDemoEvaluation(
        {
          ...response('switch'),
          candidates: [
            { ...response('switch').candidates[0], evidencePaths: [{ ...path, relations: [] }] },
          ],
        },
        request,
      ),
    ).toThrow();
    expect(() =>
      parseDemoEvaluation(
        {
          ...response('switch'),
          candidates: [{ ...response('switch').candidates[0], evidencePaths: [] }],
        },
        request,
      ),
    ).toThrow();
    expect(() =>
      parseDemoEvaluation(
        {
          ...response('switch'),
          candidates: [{ ...response('switch').candidates[0], offerIds: [] }],
        },
        request,
      ),
    ).toThrow();
  });
});
