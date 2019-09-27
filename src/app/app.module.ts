import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClickOutsideModule } from 'ng4-click-outside';

import { CollapsibleDirective } from './_directives/collapsible';
import { XmlPipe } from './_helpers';
import { TokenInterceptor } from './_services';
import { RenameWorkflowPipe, TranslatePipe, TRANSLATION_PROVIDERS } from './_translate';
import { AppComponent } from './app.component';
import {
  DashboardactionsComponent,
  DashboardComponent,
  DatasetsComponent,
  ExecutionsgridComponent,
  GridrowComponent,
  OngoingexecutionsComponent
} from './dashboard';
import { FilterOpsComponent, FilterOptionComponent } from './dashboard/filter-ops';
import {
  ActionbarComponent,
  DatasetComponent,
  DatasetformComponent,
  DatasetlogComponent,
  ExecutionsDataGridComponent,
  GeneralinfoComponent,
  HistoryComponent,
  LastExecutionComponent,
  MappingComponent,
  NewDatasetComponent,
  PreviewComponent,
  ReportSimpleComponent,
  StatisticsComponent,
  WorkflowComponent,
  WorkflowFormFieldComponent,
  WorkflowFormFieldHarvestComponent,
  WorkflowFormFieldLinkCheckComponent,
  WorkflowFormFieldTransformComponent,
  WorkflowHeaderComponent
} from './dataset';
import { HomeComponent } from './home';
import { LoadAnimationComponent } from './load-animation';
import { LoadTitleComponent } from './load-title';
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
  TextWithLinksComponent
} from './shared';
import { ThemeSelectorComponent } from './theme-selector';

@NgModule({
  declarations: [
    AppComponent,
    CollapsibleDirective,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    LoadAnimationComponent,
    LoadTitleComponent,
    PageNotFoundComponent,
    HeaderComponent,
    HomeComponent,
    DatasetComponent,
    NewDatasetComponent,
    DashboardComponent,
    DatasetformComponent,
    FilterOpsComponent,
    FilterOptionComponent,
    PasswordCheckComponent,
    TextWithLinksComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ExecutionsDataGridComponent,
    ActionbarComponent,
    LastExecutionComponent,
    HistoryComponent,
    ActionbarComponent,
    WorkflowComponent,
    WorkflowHeaderComponent,
    WorkflowFormFieldComponent,
    WorkflowFormFieldHarvestComponent,
    WorkflowFormFieldLinkCheckComponent,
    WorkflowFormFieldTransformComponent,
    MappingComponent,
    PreviewComponent,
    DatasetlogComponent,
    OngoingexecutionsComponent,
    ReportSimpleComponent,
    StatisticsComponent,
    ThemeSelectorComponent,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe,
    GridrowComponent,
    ExecutionsgridComponent,
    NotificationComponent,
    LoadingButtonComponent,
    DatasetsComponent
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
  entryComponents: [
    DatasetformComponent,
    HistoryComponent,
    MappingComponent,
    PreviewComponent,
    WorkflowComponent
  ],
  providers: [
    TRANSLATION_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
