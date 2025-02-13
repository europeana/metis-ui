import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivateAuthRole } from '../createAuthGuard';
import { DashboardComponent } from '../dashboard';
import { DatasetComponent, NewDatasetComponent } from '../dataset';
import { HomeComponent } from '../home';
import { PageNotFoundComponent } from '../page-not-found';
import { SearchResultsComponent } from '../search-results';

// if you add a route, make sure to use the DocumentTitleService in the component to set the title
// see NewDatasetComponent for an example

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'data-officer' }
  },
  {
    path: 'dataset/new',
    component: NewDatasetComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'data-officer' }
  },
  {
    path: 'dataset/:tab/:id',
    component: DatasetComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'data-officer' }
  },
  { path: 'dataset', redirectTo: '/dataset/new', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'search',
    component: SearchResultsComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'data-officer' }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
