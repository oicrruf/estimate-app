import { Routes } from '@angular/router';
import { Home } from './app';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'demo', loadComponent: () => import('./demo/demo').then((module) => module.Demo) },
];
