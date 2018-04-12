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
         CountriesService,          
         SettingsService, 
         WorkflowService,
         ErrorService,
         TranslateService } from './_services';

import { AppComponent } from './app.component';
import { RegisterComponent } from './register';
import { LoginComponent } from './login';
import { ProfileComponent } from './profile';
import { HeaderComponent,
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
         PreviewComponent } from './dataset';
import { DashboardComponent,
         DashboardactionsComponent } from './dashboard';
import { PageNotFoundComponent } from './page-not-found';

import { ExecutionsComponent } from './dashboard/executions/executions.component';
import { OngoingexecutionsComponent } from './dashboard/ongoingexecutions/ongoingexecutions.component';
import { ReportComponent } from './dataset/report/report.component';

import { CodemirrorModule } from 'ng2-codemirror';
import { ClickOutsideModule } from 'ng4-click-outside';


import { XmlPipe }   from './_helpers';
import { TRANSLATION_PROVIDERS, TranslatePipe, RenameWorkflowPipe }   from './_translate';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    PageNotFoundComponent,
    HeaderComponent,
    HomeComponent,
    DatasetComponent,
    DashboardComponent,
    DatasetformComponent,
    DatasetDirective,
    PasswordCheckComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ActionbarComponent,
    HistoryComponent,
    ActionbarComponent,
    MappingComponent,
    PreviewComponent,
    DatasetlogComponent,
    ExecutionsComponent,
    OngoingexecutionsComponent,
    ReportComponent,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,    
    HttpClientModule,
    AppRoutingModule,
    CodemirrorModule,
    ClickOutsideModule 
  ],
  entryComponents: [ DatasetformComponent, HistoryComponent, MappingComponent, PreviewComponent ],
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
      multi: true
    }    
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
