import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type DemoRequest =
  | { scenario: 'switch'; poePortsMin: 8 | 12 }
  | { scenario: 'camera'; quantity: 2 | 4 }
  | { scenario: 'ups' };

export type CandidateStatus =
  | 'COMPATIBLE'
  | 'INCOMPATIBLE'
  | 'INSUFFICIENT_STOCK'
  | 'TECHNICALLY_COMPATIBLE_NO_OFFER'
  | 'UNKNOWN';

export interface EvidenceNode {
  id: string;
  type: string;
  source?: string;
}

export interface EvidencePath {
  nodes: EvidenceNode[];
  relations: string[];
}

export interface DemoCandidate {
  productId: string;
  status: CandidateStatus;
  reasonCodes: string[];
  offerIds: string[];
  evidencePaths: EvidencePath[];
}

export interface DemoEvaluation {
  scenario: DemoRequest['scenario'];
  selectedProductId: string | null;
  candidates: DemoCandidate[];
  requestedQuantity?: number;
  availableQuantity?: number;
}

const statuses = new Set<CandidateStatus>([
  'COMPATIBLE',
  'INCOMPATIBLE',
  'INSUFFICIENT_STOCK',
  'TECHNICALLY_COMPATIBLE_NO_OFFER',
  'UNKNOWN',
]);

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Respuesta de demostración inválida');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, max = 120): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max) {
    throw new Error('Texto de demostración inválido');
  }
  return value;
}

function boundedArray(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) {
    throw new Error('Lista de demostración inválida');
  }
  return value as unknown[];
}

function optionalCount(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 10000) {
    throw new Error('Cantidad de demostración inválida');
  }
  return value as number;
}

export function parseDemoEvaluation(value: unknown, request: DemoRequest): DemoEvaluation {
  const response = record(value);
  if (response['scenario'] !== request.scenario) {
    throw new Error('El escenario de la respuesta no coincide con la solicitud');
  }
  const candidates = boundedArray(response['candidates'], 8).map((rawCandidate) => {
    const candidate = record(rawCandidate);
    const status = text(candidate['status'], 50) as CandidateStatus;
    if (!statuses.has(status)) throw new Error('Estado de candidato desconocido');
    const paths = boundedArray(candidate['evidencePaths'], 12).map((rawPath) => {
      const path = record(rawPath);
      const nodes = boundedArray(path['nodes'], 8).map((rawNode) => {
        const node = record(rawNode);
        return {
          id: text(node['id']),
          type: text(node['type'], 40),
          ...(node['source'] === undefined ? {} : { source: text(node['source']) }),
        } satisfies EvidenceNode;
      });
      const relations = boundedArray(path['relations'], 7).map((relation) => text(relation, 60));
      if (nodes.length < 2 || relations.length !== nodes.length - 1) {
        throw new Error('Ruta de evidencia inválida');
      }
      return { nodes, relations } satisfies EvidencePath;
    });
    if (status !== 'UNKNOWN' && paths.length === 0) {
      throw new Error('Candidato sin ruta de evidencia');
    }
    const reasonCodes = boundedArray(candidate['reasonCodes'], 8).map((reason) => text(reason, 80));
    if (reasonCodes.length === 0) throw new Error('Candidato sin motivo');
    const offerIds = boundedArray(candidate['offerIds'], 8).map((offer) => text(offer));
    if (status === 'TECHNICALLY_COMPATIBLE_NO_OFFER' && offerIds.length !== 0) {
      throw new Error('La ausencia de oferta contradice los datos');
    }
    return {
      productId: text(candidate['productId']),
      status,
      reasonCodes,
      offerIds,
      evidencePaths: paths,
    } satisfies DemoCandidate;
  });
  if (candidates.length === 0) throw new Error('Respuesta sin candidatos');
  const selectedProductId =
    response['selectedProductId'] === null ? null : text(response['selectedProductId']);
  if (
    selectedProductId !== null &&
    !candidates.some(
      (item) =>
        item.productId === selectedProductId &&
        item.status === 'COMPATIBLE' &&
        item.offerIds.length > 0,
    )
  ) {
    throw new Error('La selección no tiene un candidato elegible');
  }
  if (
    selectedProductId === null &&
    candidates.some((item) => item.status === 'COMPATIBLE' && item.offerIds.length > 0)
  ) {
    throw new Error('La respuesta omite una selección elegible');
  }
  return {
    scenario: request.scenario,
    selectedProductId,
    candidates,
    requestedQuantity: optionalCount(response['requestedQuantity']),
    availableQuantity: optionalCount(response['availableQuantity']),
  };
}

export function demoUrl(request: DemoRequest): string {
  const params = new URLSearchParams({ scenario: request.scenario });
  if (request.scenario === 'switch') params.set('poe_ports_min', String(request.poePortsMin));
  if (request.scenario === 'camera') params.set('quantity', String(request.quantity));
  return `/v1/demo/evaluate?${params.toString()}`;
}

@Injectable({ providedIn: 'root' })
export class DemoApi {
  private readonly http = inject(HttpClient);

  async evaluate(request: DemoRequest): Promise<DemoEvaluation> {
    const body = await firstValueFrom(this.http.get<unknown>(demoUrl(request)));
    return parseDemoEvaluation(body, request);
  }
}
