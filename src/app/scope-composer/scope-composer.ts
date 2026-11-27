import { Component, effect, inject, InjectionToken, signal, Signal } from '@angular/core';
import {
  AuthenticatedProjectEditor,
  previewScopeReview,
  ScopeReviewFailure,
  ScopeReviewPreview,
  ScopeReviewPreviewError,
} from '../api/scope-review-preview';

/** Install only after a real session adapter can resolve the active project editor. */
export type ScopeReviewRuntime = Readonly<{
  baseUrl: string;
  /** Opaque revision changed by the trusted adapter on account or project changes. */
  contextVersion: Signal<number>;
  editor: () => Promise<AuthenticatedProjectEditor | null>;
  fetcher: typeof fetch;
}>;

export const SCOPE_REVIEW_RUNTIME = new InjectionToken<ScopeReviewRuntime>('scope review runtime');

const errorCopy: Record<ScopeReviewFailure, string> = {
  invalid_input: 'Revisa el texto y vuelve a intentar.',
  invalid_response: 'La respuesta no cumple el contrato de revisión. No se muestra una propuesta.',
  unauthorized: 'La sesión ya no permite esta revisión. Comprueba tu acceso.',
  forbidden: 'No tienes permiso para revisar este proyecto.',
  not_found: 'El recurso no está disponible o ya no tienes acceso.',
  conflict: 'La solicitud cambió. Revisa el texto antes de intentarlo otra vez.',
  limited: 'Se alcanzó el límite de solicitudes. Espera y vuelve a intentar.',
  offline: 'No hay conexión con el servicio. Vuelve a intentar.',
  unavailable: 'El servicio no está disponible. Vuelve a intentar.',
};

@Component({
  selector: 'app-scope-composer',
  templateUrl: './scope-composer.html',
  styleUrl: './scope-composer.css',
})
export class ScopeComposer {
  private readonly runtime = inject(SCOPE_REVIEW_RUNTIME);
  private revision = 0;
  private accessCheck = 0;
  private retryKey: string | null = null;

  readonly draft = signal('');
  readonly ready = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<ScopeReviewPreview | null>(null);

  constructor() {
    effect(() => {
      this.runtime.contextVersion();
      this.revision += 1;
      this.retryKey = null;
      void this.refreshAccess();
    });
  }

  async refreshAccess(): Promise<void> {
    const accessCheck = ++this.accessCheck;
    this.ready.set(false);
    this.result.set(null);
    try {
      const editor = await this.runtime.editor();
      if (accessCheck !== this.accessCheck) return;
      this.ready.set(editor?.kind === 'authenticated-project-editor');
    } catch {
      if (accessCheck !== this.accessCheck) return;
      this.ready.set(false);
    }
    if (!this.ready()) this.error.set('Necesitas una sesión con permiso editorial para continuar.');
    else this.error.set(null);
  }

  changeDraft(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
    this.retryKey = null;
    this.revision += 1;
    this.result.set(null);
    this.error.set(null);
  }

  canSubmit(): boolean {
    return this.ready() && !this.busy() && !!this.draft().trim() &&
      [...this.draft()].length <= 4000;
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.busy.set(true);
    this.result.set(null);
    this.error.set(null);
    const revision = this.revision;
    const contextVersion = this.runtime.contextVersion();
    const brief = this.draft();
    try {
      // Resolve again immediately before each call; a previous editor context may be revoked.
      const editor = await this.runtime.editor();
      if (contextVersion !== this.runtime.contextVersion() || revision !== this.revision) return;
      if (editor?.kind !== 'authenticated-project-editor') {
        this.ready.set(false);
        this.error.set('Necesitas una sesión con permiso editorial para continuar.');
        return;
      }
      const idempotencyKey = this.retryKey ?? globalThis.crypto.randomUUID();
      this.retryKey = idempotencyKey;
      const result = await previewScopeReview(
        this.runtime.baseUrl, editor, brief, idempotencyKey, this.runtime.fetcher,
      );
      if (revision === this.revision && contextVersion === this.runtime.contextVersion())
        this.result.set(result);
    } catch (cause) {
      if (revision !== this.revision || contextVersion !== this.runtime.contextVersion()) return;
      const code = cause instanceof ScopeReviewPreviewError ? cause.code : 'unavailable';
      this.error.set(errorCopy[code]);
      if (code === 'unauthorized' || code === 'forbidden' || code === 'not_found') {
        this.ready.set(false);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
