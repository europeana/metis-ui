import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClickOutsideModule } from 'ng4-click-outside';

import { XmlPipe } from './_helpers';
import { TokenInterceptor } from './_services';
import { RenameWorkflowPipe, TranslatePipe, TRANSLATION_PROVIDERS } from './_translate';
import { AppComponent } from './app.component';
import {
  DashboardactionsComponent,
  DashboardComponent,
  DatasetsComponent,
  ExecutionsComponent,
  ExecutiontableComponent,
  OngoingexecutionsComponent,
} from './dashboard';
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
  TextWithLinksComponent,
} from './shared';
import { ThemeSelectorComponent } from './theme-selector';

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
    TextWithLinksComponent,
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
    ThemeSelectorComponent,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe,
    ExecutiontableComponent,
    NotificationComponent,
    LoadingButtonComponent,
    DatasetsComponent,
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
    TRANSLATION_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
