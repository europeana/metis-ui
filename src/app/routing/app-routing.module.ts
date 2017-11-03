import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from '../dashboard';
import { DatasetComponent } from '../dataset';
import { HomeComponent } from '../home';
import { LoginComponent } from '../login';
import { ProfileComponent } from '../profile';
import { RegisterComponent } from '../register';
import { RequestsComponent } from '../requests';

import { AuthVisitorGuard, AuthUserGuard } from '../_guards';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset/:tab', component: DatasetComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset', redirectTo: '/dataset/new', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthVisitorGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthUserGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthVisitorGuard] },
  { path: 'requests', component: RequestsComponent, canActivate: [AuthUserGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
