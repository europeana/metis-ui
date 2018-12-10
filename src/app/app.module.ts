import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClickOutsideModule } from 'ng4-click-outside';

import { AuthUserGuard, AuthVisitorGuard } from './_guards';
import { XmlPipe } from './_helpers';
import {
  AuthenticationService,
  CountriesService,
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  SettingsService,
  TokenInterceptor,
  WorkflowService,
} from './_services';
import {
  RenameWorkflowPipe,
  TranslatePipe,
  TranslateService,
  TRANSLATION_PROVIDERS,
} from './_translate';
import { AppComponent } from './app.component';
import {
  DashboardactionsComponent,
  DashboardComponent,
  ExecutionsComponent,
  ExecutiontableComponent,
  OngoingexecutionsComponent,
} from './dashboard';
import {
  ActionbarComponent,
  DatasetComponent,
  DatasetformComponent,
  DatasetlogComponent,
  GeneralactionbarComponent,
  GeneralinfoComponent,
  HistoryComponent,
  LastExecutionComponent,
  MappingComponent,
  NewDatasetComponent,
  PreviewComponent,
  ReportComponent,
  WorkflowComponent,
} from './dataset';
import { HomeComponent } from './home';
import { LoadAnimationComponent } from './load-animation';
import { LoginComponent } from './login';
import { PageNotFoundComponent } from './page-not-found';
import { ProfileComponent } from './profile';
import { RegisterComponent } from './register';
import { AppRoutingModule } from './routing';
import {
  HeaderComponent,
  LoadingButtonComponent,
  NotificationComponent,
  PasswordCheckComponent,
} from './shared';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    LoadAnimationComponent,
    PageNotFoundComponent,
    HeaderComponent,
    HomeComponent,
    DatasetComponent,
    NewDatasetComponent,
    DashboardComponent,
    DatasetformComponent,
    PasswordCheckComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ActionbarComponent,
    LastExecutionComponent,
    HistoryComponent,
    ActionbarComponent,
    WorkflowComponent,
    MappingComponent,
    PreviewComponent,
    DatasetlogComponent,
    ExecutionsComponent,
    OngoingexecutionsComponent,
    ReportComponent,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe,
    GeneralactionbarComponent,
    ExecutiontableComponent,
    NotificationComponent,
    LoadingButtonComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CodemirrorModule,
    ClickOutsideModule,
  ],
  entryComponents: [
    DatasetformComponent,
    HistoryComponent,
    MappingComponent,
    PreviewComponent,
    WorkflowComponent,
  ],
  providers: [
    AuthVisitorGuard,
    AuthUserGuard,
    AuthenticationService,
    DatasetsService,
    RedirectPreviousUrl,
    CountriesService,
    SettingsService,
    WorkflowService,
    ErrorService,
    TRANSLATION_PROVIDERS,
    TranslateService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
