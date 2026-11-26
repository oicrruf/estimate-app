import { Component, inject, signal } from '@angular/core';
import { DemoApi, DemoCandidate, DemoEvaluation, DemoRequest } from './demo-api';

type Scenario = DemoRequest['scenario'];

const reasonLabels: Record<string, string> = {
  MEETS_REQUIREMENTS: 'Cumple los requisitos declarados',
  TOTAL_PORTS_BELOW_REQUIRED: 'Puertos totales insuficientes',
  POE_PORTS_BELOW_REQUIRED: 'Puertos PoE insuficientes',
  POE_BUDGET_BELOW_REQUIRED: 'Presupuesto PoE insuficiente',
  TECHNICAL_REQUIREMENT_NOT_MET: 'Requisito técnico no cumplido',
  SHARED_POOL_CAPACITY: 'Inventario compartido insuficiente',
  INSUFFICIENT_STOCK: 'Inventario insuficiente',
  MEETS_TECHNICAL_REQUIREMENT_NO_OFFER: 'Cumple técnicamente, sin oferta',
  CAPACITY_BELOW_REQUIRED: 'Capacidad insuficiente',
};

@Component({
  selector: 'app-demo',
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class Demo {
  private readonly api = inject(DemoApi);
  private requestSequence = 0;

  readonly scenario = signal<Scenario>('switch');
  readonly poePortsMin = signal<8 | 12>(8);
  readonly quantity = signal<2 | 4>(4);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly result = signal<DemoEvaluation | null>(null);
  readonly lastRequest = signal<DemoRequest | null>(null);

  chooseScenario(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'switch' || value === 'camera' || value === 'ups') {
      this.scenario.set(value);
      this.clearResult();
    }
  }

  choosePoe(value: 8 | 12): void {
    this.poePortsMin.set(value);
    this.clearResult();
  }

  chooseQuantity(value: 2 | 4): void {
    this.quantity.set(value);
    this.clearResult();
  }

  private clearResult(): void {
    this.requestSequence += 1;
    this.result.set(null);
    this.error.set(false);
    this.lastRequest.set(null);
    this.loading.set(false);
  }

  private currentRequest(): DemoRequest {
    if (this.scenario() === 'switch') {
      return { scenario: 'switch', poePortsMin: this.poePortsMin() };
    }
    if (this.scenario() === 'camera') {
      return { scenario: 'camera', quantity: this.quantity() };
    }
    return { scenario: 'ups' };
  }

  async evaluate(event: Event): Promise<void> {
    event.preventDefault();
    if (this.loading()) return;
    const request = this.currentRequest();
    const sequence = ++this.requestSequence;
    this.result.set(null);
    this.error.set(false);
    this.lastRequest.set(request);
    this.loading.set(true);
    try {
      const result = await this.api.evaluate(request);
      if (sequence === this.requestSequence) this.result.set(result);
    } catch {
      if (sequence === this.requestSequence) this.error.set(true);
    } finally {
      if (sequence === this.requestSequence) this.loading.set(false);
    }
  }

  scenarioLabel(value: Scenario): string {
    return { switch: 'Switch PoE', camera: 'Cámara PoE', ups: 'UPS' }[value];
  }

  decisionLabel(value: DemoEvaluation): string {
    if (value.selectedProductId) return `Elegible: ${value.selectedProductId}`;
    if (
      value.candidates.some((candidate) => candidate.status === 'TECHNICALLY_COMPATIBLE_NO_OFFER')
    ) {
      return 'Compatible técnicamente, sin oferta';
    }
    if (value.candidates.some((candidate) => candidate.status === 'INSUFFICIENT_STOCK')) {
      return 'Inventario insuficiente';
    }
    if (value.candidates.some((candidate) => candidate.status === 'UNKNOWN')) {
      return 'Evaluación pendiente';
    }
    return 'Sin producto adquirible elegible';
  }

  statusLabel(candidate: DemoCandidate): string {
    return {
      COMPATIBLE: 'Compatible y disponible',
      INCOMPATIBLE: 'Incompatible',
      INSUFFICIENT_STOCK: 'Inventario insuficiente',
      TECHNICALLY_COMPATIBLE_NO_OFFER: 'Compatible técnicamente, sin oferta',
      UNKNOWN: 'Pendiente de evidencia',
    }[candidate.status];
  }

  reasonLabel(code: string): string {
    return reasonLabels[code] ?? code;
  }
}
