import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './routing/app-routing.module';

import { AuthGuard } from './_guards/index';
import { AuthenticationService } from './_services/index';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register/index';
import { LoginComponent } from './login/index';
import { ProfileComponent } from './profile/index';
import { HeaderComponent,
         FooterComponent } from './shared/index';
import { HomeComponent } from './home/index';
import { DatasetComponent,
         DatasetformComponent,
         DatasetDirective } from './dataset/index';
import { RequestsComponent } from './requests/index';
import { DashboardComponent } from './dashboard/index';

// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    DatasetComponent,
    RequestsComponent,
    DashboardComponent,
    DatasetformComponent,
    DatasetDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  entryComponents: [ DatasetformComponent ],
  providers: [
    AuthGuard,
    AuthenticationService,

    // providers used to create fake backend
    fakeBackendProvider,
    MockBackend,
    BaseRequestOptions
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
