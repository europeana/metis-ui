import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivateAuthRole } from 'shared';
import { SandboxNavigatonComponent } from './sandbox-navigation';

const routes: Routes = [
  {
    path: 'dataset/:id',
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'dataset',
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'new',
    canActivate: [canActivateAuthRole],
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true,
      role: 'data-officer'
    }
  },
  {
    path: 'cookie-policy',
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'privacy-statement',
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: '',
    component: SandboxNavigatonComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'x',
    component: SandboxNavigatonComponent,
    pathMatch: 'prefix',
    data: {
      reuseComponent: true
    },
    children: [
      {
        path: '',
        redirectTo: '..',
        pathMatch: 'full'
      },
      {
        path: 'arrows',
        loadComponent: async () =>
          (await import('./doc-arrows/doc-arrows.component')).DocArrowsComponent,
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '..',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
    data: {
      reuseComponent: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
