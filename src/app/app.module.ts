import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule,
         HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './routing/app-routing.module';

import { AuthUserGuard,
         AuthVisitorGuard } from './_guards';
import { AuthenticationService,
         DatasetsService,
         TokenInterceptor,
         RedirectPreviousUrl,         
         NotificationsService,
         CountriesService,
         ProvidersService, 
         SettingsService } from './_services';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register';
import { LoginComponent } from './login';
import { ProfileComponent } from './profile';
import { HeaderComponent,
         FooterComponent,
         PasswordCheckComponent } from './shared';
import { HomeComponent } from './home';
import { DatasetComponent,
         DatasetformComponent,
         DatasetDirective,
         GeneralinfoComponent,
         DatasetlogComponent,
         HistoryComponent,
         ActionbarComponent,
         MappingComponent,
         PreviewComponent,
         QualityassuranceComponent } from './dataset';
import { DashboardComponent,
         DashboardactionsComponent } from './dashboard';
import { PageNotFoundComponent } from './page-not-found';

import { UsersComponent,
         UserDetailComponent } from './users';
import { ExecutionsComponent } from './dashboard/executions/executions.component';
import { OngoingexecutionsComponent } from './dashboard/ongoingexecutions/ongoingexecutions.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    PageNotFoundComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    DatasetComponent,
    DashboardComponent,
    DatasetformComponent,
    DatasetDirective,
    PasswordCheckComponent,
    UsersComponent,
    UserDetailComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ActionbarComponent,
    HistoryComponent,
    ActionbarComponent,
    MappingComponent,
    PreviewComponent,
    QualityassuranceComponent,
    DatasetlogComponent,
    ExecutionsComponent,
    OngoingexecutionsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,    
    HttpClientModule,
    AppRoutingModule    
  ],
  entryComponents: [ DatasetformComponent, HistoryComponent, MappingComponent, PreviewComponent, QualityassuranceComponent ],
  providers: [
    AuthVisitorGuard,
    AuthUserGuard,
    AuthenticationService,
    DatasetsService,
    RedirectPreviousUrl,
    NotificationsService,
    CountriesService,
    ProvidersService,
    SettingsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }    
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
