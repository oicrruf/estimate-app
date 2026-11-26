import { Component, inject, signal } from '@angular/core';
import { ReviewCase, ReviewCaseId, ReviewFixture, ReviewFixtureApi, ReviewLineState } from './review-fixture';

@Component({
  selector: 'app-review-preview',
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class ReviewPreview {
  private readonly api = inject(ReviewFixtureApi);
  readonly selected = signal<ReviewCaseId>('eight');
  readonly fixture = signal<ReviewFixture | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.fixture.set(await this.api.load());
    } catch {
      this.fixture.set(null);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  choose(value: ReviewCaseId): void {
    this.selected.set(value);
  }

  current(): ReviewCase | null {
    return this.fixture()?.cases[this.selected()] ?? null;
  }

  stateLabel(state: ReviewLineState): string {
    return {
      user_requested: 'Solicitado',
      agent_proposed: 'Propuesto para revisión',
      pending_measurement: 'Pendiente de medición',
    }[state];
  }
}
