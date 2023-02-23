import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
