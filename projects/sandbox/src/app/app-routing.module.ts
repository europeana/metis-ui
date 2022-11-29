import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardComponent } from './wizard';
import { HomeComponent } from './home';

const routes: Routes = [
  {
    path: 'dataset/:id',
    component: WizardComponent
  },
  {
    path: 'dataset',
    component: WizardComponent
  },
  {
    path: 'new',
    component: WizardComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
