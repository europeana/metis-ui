import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ClickOutsideModule } from 'ng-click-outside';
import { CollapsibleDirective } from './_directives/collapsible';
import { XmlPipe } from './_helpers';
import { TokenInterceptor } from './_services';
import { RenameWorkflowPipe, TranslatePipe, TRANSLATION_PROVIDERS } from './_translate';
import { AppComponent } from './app.component';
import {
  DashboardactionsComponent,
  DashboardComponent,
  ExecutionsgridComponent,
  GridrowComponent,
  OngoingexecutionsComponent
} from './dashboard';
import { FilterOpsComponent, FilterOptionComponent } from './dashboard/filter-ops';
import { DataPollingComponent } from './data-polling';
import {
  ActionbarComponent,
  DatasetComponent,
  DatasetformComponent,
  DatasetlogComponent,
  DepublicationComponent,
  DepublicationRowComponent,
  ExecutionsDataGridComponent,
  GeneralinfoComponent,
  HistoryComponent,
  LastExecutionComponent,
  MappingComponent,
  NewDatasetComponent,
  PreviewComponent,
  RedirectionComponent,
  ReportSimpleComponent,
  SortableGroupComponent,
  SortableHeaderComponent,
  StatisticsComponent,
  TabHeadersComponent,
  WorkflowComponent,
  WorkflowFormFieldComponent,
  WorkflowFormFieldHarvestComponent,
  WorkflowFormFieldLinkCheckComponent,
  WorkflowFormFieldTransformComponent,
  WorkflowHeaderComponent
} from './dataset';
import { FileUploadComponent } from './file-upload';
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
  ModalConfirmComponent,
  NotificationComponent,
  PasswordCheckComponent,
  SearchComponent,
  TextWithLinksComponent
} from './shared';
import { SearchResultsComponent } from './search-results';
import { ThemeSelectorComponent } from './theme-selector';

@NgModule({
  declarations: [
    ActionbarComponent,
    DataPollingComponent,
    AppComponent,
    CollapsibleDirective,
    ModalConfirmComponent,
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
    DepublicationComponent,
    DepublicationRowComponent,
    FilterOpsComponent,
    FilterOptionComponent,
    PasswordCheckComponent,
    SearchComponent,
    TextWithLinksComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ExecutionsDataGridComponent,
    FileUploadComponent,
    LastExecutionComponent,
    HistoryComponent,
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
    RedirectionComponent,
    ReportSimpleComponent,
    SearchResultsComponent,
    SortableHeaderComponent,
    SortableGroupComponent,
    StatisticsComponent,
    TabHeadersComponent,
    ThemeSelectorComponent,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe,
    GridrowComponent,
    ExecutionsgridComponent,
    NotificationComponent,
    LoadingButtonComponent
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
