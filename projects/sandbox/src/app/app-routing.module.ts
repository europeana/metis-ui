import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardComponent } from './wizard';

const routes: Routes = [
  {
    path: 'dataset/:id',
    component: WizardComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'dataset',
    component: WizardComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: 'new',
    component: WizardComponent,
    data: {
      reuseComponent: true
    }
  },
  {
    path: '',
    component: WizardComponent,
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
