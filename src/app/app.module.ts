import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';

import { HttpClientModule,
         HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './routing/app-routing.module';

import { AuthUserGuard,
         AuthVisitorGuard } from './_guards';
import { AuthenticationService,
         TokenInterceptor,
         RedirectPreviousUrl,
         DatasetsService,
         NotificationsService } from './_services';

import { AppComponent } from './app.component';
import { RegisterComponent,
         RegisterNotfoundComponent } from './register';
import { LoginComponent } from './login';
import { ProfileComponent } from './profile';
import { HeaderComponent,
         FooterComponent,
         PasswordCheckComponent } from './shared';
import { HomeComponent } from './home';
import { DatasetComponent,
         DatasetformComponent,
         DatasetDirective,
         DatasetDetailComponent } from './dataset';
import { RequestsComponent } from './requests';
import { DashboardComponent } from './dashboard';
import { PageNotFoundComponent } from './page-not-found';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { UsersComponent,
         UserDetailComponent } from './users';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers';
// import { MockBackend } from '@angular/http/testing';
// import { BaseRequestOptions } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    RegisterNotfoundComponent,
    LoginComponent,
    ProfileComponent,
    PageNotFoundComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    DatasetComponent,
    RequestsComponent,
    DashboardComponent,
    DatasetformComponent,
    DatasetDirective,
    DatasetDetailComponent,
    PasswordCheckComponent,
    UsersComponent,
    UserDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    FlashMessagesModule
  ],
  entryComponents: [ DatasetformComponent ],
  providers: [
    AuthVisitorGuard,
    AuthUserGuard,
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    RedirectPreviousUrl,
    DatasetsService,
    NotificationsService

    // providers used to create fake backend
    // fakeBackendProvider,
    // MockBackend,
    // BaseRequestOptions
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
