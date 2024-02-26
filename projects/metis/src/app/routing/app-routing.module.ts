import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthUserGuard, AuthVisitorGuard } from '../_guards';
import { DashboardComponent } from '../dashboard';
import { DatasetComponent, NewDatasetComponent } from '../dataset';
import { HomeComponent } from '../home';
import { LoginComponent } from '../login';
import { PageNotFoundComponent } from '../page-not-found';
import { ProfileComponent } from '../profile';
import { RegisterComponent } from '../register';
import { SearchResultsComponent } from '../search-results';

// if you add a route, make sure to use the DocumentTitleService in the component to set the title
// see NewDatasetComponent for an example

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthUserGuard]
  },
  {
    path: 'dataset/new',
    component: NewDatasetComponent,
    canActivate: [AuthUserGuard]
  },
  {
    path: 'dataset/:tab/:id',
    component: DatasetComponent,
    canActivate: [AuthUserGuard]
  },
  { path: 'dataset', redirectTo: '/dataset/new', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'search',
    component: SearchResultsComponent,
    canActivate: [AuthUserGuard]
  },
  {
    path: 'signin',
    component: LoginComponent,
    canActivate: [AuthVisitorGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthUserGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthVisitorGuard]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
