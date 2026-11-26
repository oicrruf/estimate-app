import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { emptyA2uiSource } from './a2ui/a2ui-boundary';

@Component({
  selector: 'app-home',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class Home {
  protected readonly a2ui = emptyA2uiSource;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
