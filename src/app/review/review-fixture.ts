import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ReviewCaseId = 'eight' | 'missing' | 'changed';
export type ReviewLineState = 'user_requested' | 'agent_proposed' | 'pending_measurement';

export interface ReviewLine {
  key: string;
  state: ReviewLineState;
  quantity: number | null;
  unit: string;
  evidenceStatus: 'unknown';
  ruleId: string | null;
  sourceRefs: string[];
}

export interface ReviewCase {
  status: 'pending_specialist';
  constraintReason: null | 'document_missing';
  checks: { id: string; status: 'pass' | 'fail' | 'pending' }[];
  lines: ReviewLine[];
  evidencePaths: string[][];
  changes: { key: string; change: 'added' | 'removed' | 'changed' | 'approval_stale' }[];
  intakeQuestions: string[];
}

export interface ReviewFixture {
  cases: Record<ReviewCaseId, ReviewCase>;
}

export const FIXTURE_URL = '/fixtures/at248-review.v1.json';
const sourceCommit = 'fe9440727636c1b5c89d2f876fa7448a4d4816a7';

function invalid(): never {
  throw new Error('Fixture de revisión inválida');
}

function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) invalid();
  const object = value as Record<string, unknown>;
  if (Object.keys(object).sort().join('|') !== [...keys].sort().join('|')) invalid();
  return object;
}

function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) invalid();
  return value;
}

function text(value: unknown, max = 180): string {
  if (typeof value !== 'string' || !value || value.length > max) invalid();
  return value;
}

function lines(value: unknown): ReviewLine[] {
  return list(value, 16).map((raw) => {
    const line = record(raw, [
      'key', 'state', 'quantity', 'unit', 'evidenceStatus', 'ruleId', 'sourceRefs',
    ]);
    const state = line['state'];
    if (state !== 'user_requested' && state !== 'agent_proposed' && state !== 'pending_measurement')
      invalid();
    const quantity = line['quantity'];
    if (
      quantity !== null &&
      (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10000)
    ) invalid();
    if (line['evidenceStatus'] !== 'unknown') invalid();
    const refs = list(line['sourceRefs'], 6).map((ref) => text(ref, 200));
    if (refs.some((ref) => !ref.startsWith('synthetic://'))) invalid();
    const ruleId = line['ruleId'];
    if (ruleId !== null) text(ruleId, 100);
    return {
      key: text(line['key'], 100), state, quantity, unit: text(line['unit'], 30),
      evidenceStatus: 'unknown', ruleId, sourceRefs: refs,
    } as ReviewLine;
  });
}

function reviewCase(value: unknown): ReviewCase {
  const entry = record(value, [
    'stage', 'reviewRequired', 'persisted', 'status', 'commercialReady',
    'constraintReason', 'checks', 'lines', 'evidencePaths', 'changes', 'intakeQuestions',
  ]);
  if (
    entry['stage'] !== 'scope_review_pending' || entry['reviewRequired'] !== true ||
    entry['persisted'] !== false || entry['commercialReady'] !== false ||
    entry['status'] !== 'pending_specialist' ||
    (entry['constraintReason'] !== null && entry['constraintReason'] !== 'document_missing')
  ) invalid();
  const checks = list(entry['checks'], 2).map((raw) => {
    const check = record(raw, ['id', 'status']);
    const id = text(check['id'], 100);
    if (id !== 'global:total-ports' && id !== 'global:poe-ports') invalid();
    const status = check['status'];
    if (status !== 'pass' && status !== 'fail' && status !== 'pending') invalid();
    return { id, status };
  });
  if (new Set(checks.map((check) => check.id)).size !== checks.length) invalid();
  const evidencePaths = list(entry['evidencePaths'], 16).map((raw) =>
    list(raw, 3).map((part) => text(part, 100)),
  );
  if (evidencePaths.some((path) => path.length !== 3)) invalid();
  const changes = list(entry['changes'], 16).map((raw) => {
    const item = record(raw, ['key', 'change']);
    const change = item['change'];
    if (change !== 'added' && change !== 'removed' && change !== 'changed' && change !== 'approval_stale') invalid();
    return { key: text(item['key'], 100), change };
  });
  return {
    status: 'pending_specialist', constraintReason: entry['constraintReason'],
    checks, lines: lines(entry['lines']), evidencePaths, changes,
    intakeQuestions: list(entry['intakeQuestions'], 8).map((question) => text(question, 180)),
  } as ReviewCase;
}

export function parseReviewFixture(value: unknown): ReviewFixture {
  const fixture = record(value, ['wireVersion', 'synthetic', 'sourceCommit', 'cases']);
  if (
    fixture['wireVersion'] !== 'at248.synthetic-review.v1' ||
    fixture['synthetic'] !== true || fixture['sourceCommit'] !== sourceCommit
  ) invalid();
  const cases = record(fixture['cases'], ['eight', 'missing', 'changed']);
  const parsed = {
    eight: reviewCase(cases['eight']),
    missing: reviewCase(cases['missing']),
    changed: reviewCase(cases['changed']),
  };
  const line = (id: ReviewCaseId, key: string) => parsed[id].lines.find((item) => item.key === key);
  if (
    parsed.eight.lines.length !== 6 || parsed.missing.lines.length !== 6 ||
    parsed.changed.lines.length !== 6 ||
    parsed.eight.lines.some((item) => item.evidenceStatus !== 'unknown') ||
    parsed.eight.checks.find((item) => item.id === 'global:total-ports')?.status !== 'fail' ||
    parsed.eight.checks.find((item) => item.id === 'global:poe-ports')?.status !== 'pass' ||
    line('eight', 'camera:camera')?.state !== 'user_requested' ||
    line('eight', 'camera:camera')?.quantity !== 8 ||
    line('eight', 'network:uplink')?.quantity !== 1 ||
    line('eight', 'camera:link')?.state !== 'agent_proposed' ||
    parsed.missing.checks.length !== 0 ||
    parsed.missing.lines.some((item, index) =>
      item.quantity !== null ||
      item.state !== (index < 2 ? 'user_requested' : 'pending_measurement')
    ) ||
    parsed.missing.constraintReason !== 'document_missing' ||
    line('changed', 'camera:camera')?.quantity !== 10 ||
    parsed.changed.checks.length !== 0 ||
    parsed.changed.constraintReason !== 'document_missing' ||
    !parsed.changed.changes.some((item) => item.key === 'camera:link')
  ) invalid();
  return { cases: parsed };
}

@Injectable({ providedIn: 'root' })
export class ReviewFixtureApi {
  private readonly http = inject(HttpClient);

  async load(): Promise<ReviewFixture> {
    return parseReviewFixture(await firstValueFrom(this.http.get<unknown>(FIXTURE_URL)));
  }
}
