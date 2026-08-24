import { Routes } from '@angular/router';
import { canActivateAuthRole } from './app/_guards';
import { SandboxNavigatonComponent } from './app/sandbox-navigation';

export const routes: Routes = [
  {
    path: 'dataset/:id',
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: 'dataset',
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: 'new',
    canActivate: [canActivateAuthRole],
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: 'cookie-policy',
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: 'privacy-statement',
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: '',
    component: SandboxNavigatonComponent,
    data: { reuseComponent: true }
  },
  {
    path: 'x',
    component: SandboxNavigatonComponent,
    pathMatch: 'prefix',
    data: { reuseComponent: true },
    children: [
      { path: '', redirectTo: '..', pathMatch: 'full' },
      {
        path: 'arrows',
        loadComponent: async () =>
          (await import('./app/doc-arrows/doc-arrows.component')).DocArrowsComponent,
        pathMatch: 'full'
      },
      { path: '**', redirectTo: '..', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
    data: { reuseComponent: true }
  }
];
