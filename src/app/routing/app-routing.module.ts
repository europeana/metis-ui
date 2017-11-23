import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from '../dashboard';
import { DatasetComponent,
         DatasetDetailComponent } from '../dataset';
import { HomeComponent } from '../home';
import { LoginComponent } from '../login';
import { ProfileComponent } from '../profile';
import { RegisterComponent,
         RegisterNotfoundComponent } from '../register';
import { RequestsComponent } from '../requests';
import { UsersComponent,
         UserDetailComponent } from '../users';

import { AuthVisitorGuard, AuthUserGuard } from '../_guards';

import { PageNotFoundComponent } from '../page-not-found';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset/detail/:id', component: DatasetDetailComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset/:tab/:id', component: DatasetComponent, canActivate: [AuthUserGuard] },
  { path: 'dataset', redirectTo: '/dataset/log/1', pathMatch: 'full' }, // should be removed or updated eventually
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthVisitorGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthUserGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthVisitorGuard] },
  { path: 'register/notfound', component: RegisterNotfoundComponent, canActivate: [AuthVisitorGuard] },
  { path: 'requests', component: RequestsComponent, canActivate: [AuthUserGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthUserGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [AuthUserGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
