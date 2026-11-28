import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { emptyA2uiSource } from './a2ui/a2ui-boundary';
import { SCOPE_REVIEW_RUNTIME, ScopeComposer } from './scope-composer/scope-composer';

@Component({
  selector: 'app-home',
  imports: [ScopeComposer],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class Home {
  protected readonly a2ui = emptyA2uiSource;
  protected readonly scopeRuntime = inject(SCOPE_REVIEW_RUNTIME, { optional: true });
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
