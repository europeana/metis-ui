import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DatasetComponent } from '../dataset/dataset.component';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { ProfileComponent } from '../profile/profile.component';
import { RegisterComponent } from '../register/register.component';
import { RequestsComponent } from '../requests/requests.component';

const routes: Routes = [
  { path: 'dataset', component: DatasetComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'requests', component: RequestsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
