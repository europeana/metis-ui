import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClickOutsideModule } from 'ng4-click-outside';

import { AppRoutingModule } from './routing/app-routing.module';

import { AuthUserGuard, AuthVisitorGuard } from './_guards';
import {
  AuthenticationService,
  CountriesService,
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  SettingsService,
  TokenInterceptor,
  TranslateService,
  WorkflowService,
} from './_services';

import { AppComponent } from './app.component';
import { DashboardactionsComponent, DashboardComponent } from './dashboard';
import {
  ActionbarComponent,
  DatasetComponent,
  DatasetformComponent,
  DatasetlogComponent,
  GeneralinfoComponent,
  HistoryComponent,
  LastExecutionComponent,
  MappingComponent,
  NewDatasetComponent,
  PreviewComponent,
  WorkflowComponent,
} from './dataset';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { PageNotFoundComponent } from './page-not-found';
import { ProfileComponent } from './profile';
import { RegisterComponent } from './register';
import { HeaderComponent, PasswordCheckComponent } from './shared';

import { ExecutionsComponent } from './dashboard/executions/executions.component';
import { OngoingexecutionsComponent } from './dashboard/ongoingexecutions/ongoingexecutions.component';
import { ReportComponent } from './dataset/report/report.component';

import { XmlPipe } from './_helpers';
import { RenameWorkflowPipe, TranslatePipe, TRANSLATION_PROVIDERS } from './_translate';
import { ExecutiontableComponent } from './dashboard/executions/executiontable/executiontable.component';
import { GeneralactionbarComponent } from './dataset/generalactionbar/generalactionbar.component';
import { LoadAnimationComponent } from './load-animation';
import { NotificationComponent } from './shared/notification/notification.component';

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
