import { Component } from '@angular/core';
import { emptyA2uiSource } from './a2ui/a2ui-boundary';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly a2ui = emptyA2uiSource;
}
