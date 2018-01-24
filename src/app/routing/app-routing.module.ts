import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from '../dashboard';
import { DatasetComponent } from '../dataset';
import { HomeComponent } from '../home';
import { LoginComponent } from '../login';
import { ProfileComponent } from '../profile';
import { RegisterComponent } from '../register';

import { AuthVisitorGuard, AuthUserGuard } from '../_guards';
import { PageNotFoundComponent } from '../page-not-found';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset/:tab/:id', component: DatasetComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset/:tab', component: DatasetComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset', redirectTo: '/dataset/new', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthVisitorGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthUserGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthVisitorGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
