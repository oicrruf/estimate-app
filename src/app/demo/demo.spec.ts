import { TestBed } from '@angular/core/testing';
import { Demo } from './demo';
import { DemoApi, DemoEvaluation, DemoRequest } from './demo-api';

const evidencePath = {
  nodes: [
    { id: 'SW-16', type: 'PRODUCT' },
    { id: 'CAP-POE', type: 'CAPABILITY' },
    { id: 'EV-POE', type: 'EVIDENCE', source: 'synthetic://spec' },
  ],
  relations: ['SUPPORTS', 'SUPPORTED_BY'],
};

function evidenceFor(productId: string) {
  return {
    ...evidencePath,
    nodes: [{ ...evidencePath.nodes[0], id: productId }, ...evidencePath.nodes.slice(1)],
  };
}

function result(request: DemoRequest): DemoEvaluation {
  if (request.scenario === 'camera') {
    const available = 2;
    const compatible = request.quantity <= available;
    return {
      scenario: 'camera',
      selectedProductId: compatible ? 'CAM-POE' : null,
      requestedQuantity: request.quantity,
      availableQuantity: available,
      candidates: [
        {
          productId: 'CAM-POE',
          offerIds: ['OFFER-A', 'OFFER-B'],
          status: compatible ? 'COMPATIBLE' : 'INSUFFICIENT_STOCK',
          reasonCodes: compatible ? ['MEETS_REQUIREMENTS'] : ['SHARED_POOL_CAPACITY'],
          evidencePaths: [evidenceFor('CAM-POE')],
        },
      ],
    };
  }
  if (request.scenario === 'ups') {
    return {
      scenario: 'ups',
      selectedProductId: null,
      candidates: [
        {
          productId: 'UPS-1500',
          offerIds: [],
          status: 'TECHNICALLY_COMPATIBLE_NO_OFFER',
          reasonCodes: ['MEETS_TECHNICAL_REQUIREMENT_NO_OFFER'],
          evidencePaths: [evidenceFor('UPS-1500')],
        },
      ],
    };
  }
  const compatible = request.poePortsMin === 8;
  return {
    scenario: 'switch',
    selectedProductId: compatible ? 'SW-16' : null,
    candidates: [
      {
        productId: 'SW-8',
        offerIds: ['OFFER-SW-8'],
        status: 'INCOMPATIBLE',
        reasonCodes: ['TOTAL_PORTS_BELOW_REQUIRED'],
        evidencePaths: [evidenceFor('SW-8')],
      },
      {
        productId: 'SW-16',
        offerIds: ['OFFER-SW-16'],
        status: compatible ? 'COMPATIBLE' : 'INCOMPATIBLE',
        reasonCodes: compatible ? ['MEETS_REQUIREMENTS'] : ['POE_PORTS_BELOW_REQUIRED'],
        evidencePaths: [evidencePath],
      },
    ],
  };
}

class DemoApiDouble implements Pick<DemoApi, 'evaluate'> {
  readonly requests: DemoRequest[] = [];
  fail = false;
  overrideResult: DemoEvaluation | null = null;

  async evaluate(request: DemoRequest): Promise<DemoEvaluation> {
    this.requests.push(request);
    if (this.fail) throw new Error('offline');
    return this.overrideResult ?? result(request);
  }
}

describe('Demo', () => {
  let double: DemoApiDouble;

  beforeEach(() => {
    double = new DemoApiDouble();
    TestBed.configureTestingModule({ providers: [{ provide: DemoApi, useValue: double }] });
  });

  async function render() {
    const fixture = TestBed.createComponent(Demo);
    await fixture.whenStable();
    return fixture;
  }

  async function submit(fixture: Awaited<ReturnType<typeof render>>) {
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows switch decision and evidence, then changes on 8 to 12 PoE', async () => {
    const fixture = await render();
    const page = await submit(fixture);
    expect(double.requests[0]).toEqual({ scenario: 'switch', poePortsMin: 8 });
    expect(page.textContent).toContain('Elegible: SW-16');
    expect(page.textContent).toContain('SW-8');
    expect(page.textContent).toContain('Puertos totales insuficientes');
    expect(page.textContent).toContain('EV-POE');
    const twelve = page.querySelectorAll<HTMLInputElement>('input[name="poe"]')[1];
    twelve.click();
    await submit(fixture);
    expect(double.requests[1]).toEqual({ scenario: 'switch', poePortsMin: 12 });
    expect(page.textContent).toContain('Puertos PoE insuficientes');
    expect(page.textContent).toContain('Sin producto adquirible elegible');
  });

  it('separates shared stock at 2 and 4 from UPS with no offer', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;
    const selector = page.querySelector<HTMLSelectElement>('#scenario')!;
    selector.value = 'camera';
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    page.querySelectorAll<HTMLInputElement>('input[name="quantity"]')[0].click();
    await submit(fixture);
    expect(double.requests.at(-1)).toEqual({ scenario: 'camera', quantity: 2 });
    expect(page.textContent).toContain('Elegible: CAM-POE');
    page.querySelectorAll<HTMLInputElement>('input[name="quantity"]')[1].click();
    await submit(fixture);
    expect(double.requests.at(-1)).toEqual({ scenario: 'camera', quantity: 4 });
    expect(page.textContent).toContain('Inventario compartido insuficiente');
    expect(page.textContent).toContain('disponible: 2 de 4 solicitadas');
    selector.value = 'ups';
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await submit(fixture);
    expect(double.requests.at(-1)).toEqual({ scenario: 'ups' });
    expect(page.textContent).toContain('Compatible técnicamente, sin oferta');
    expect(page.textContent).toContain('Sin oferta registrada');
  });

  it('clears old decisions and announces service failure without fake results', async () => {
    const fixture = await render();
    const page = await submit(fixture);
    expect(page.textContent).toContain('SW-16');
    double.fail = true;
    page.querySelectorAll<HTMLInputElement>('input[name="poe"]')[1].click();
    await submit(fixture);
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('No se pudo obtener');
    expect(page.querySelector('.candidate')).toBeNull();
    expect(page.querySelector('label[for="scenario"]')).not.toBeNull();
    expect(page.querySelector('input[name="poe"]')?.closest('label')).not.toBeNull();
  });

  it('renders unknown data as pending and never interprets product text as HTML', async () => {
    double.overrideResult = {
      scenario: 'switch',
      selectedProductId: null,
      candidates: [
        {
          productId: '<img src=x onerror=alert(1)>',
          status: 'UNKNOWN',
          reasonCodes: ['MISSING_EVIDENCE'],
          offerIds: [],
          evidencePaths: [],
        },
      ],
    };
    const fixture = await render();
    const page = await submit(fixture);
    expect(page.textContent).toContain('Evaluación pendiente');
    expect(page.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(page.querySelector('.candidate img')).toBeNull();
  });
});
