import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SharedModule } from 'shared';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { CollapsibleDirective } from './_directives/collapsible';
import { XmlPipe } from './_helpers';
import { errorInterceptor, tokenInterceptor } from './_services';
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
import {
  ActionbarComponent,
  DatasetComponent,
  DatasetformComponent,
  DatasetlogComponent,
  DepublicationComponent,
  DepublicationRowComponent,
  EditorComponent,
  EditorDropDownComponent,
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
  UsernameComponent,
  WorkflowComponent,
  WorkflowFormFieldComponent,
  WorkflowFormFieldLinkCheckComponent,
  WorkflowFormFieldMediaProcessComponent,
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
  SearchComponent,
  TextWithLinksComponent
} from './shared';
import { SearchResultsComponent } from './search-results';

@NgModule({
  declarations: [
    ActionbarComponent,
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
    DepublicationComponent,
    DepublicationRowComponent,
    EditorComponent,
    FilterOpsComponent,
    FilterOptionComponent,
    PasswordCheckComponent,
    SearchComponent,
    TextWithLinksComponent,
    GeneralinfoComponent,
    DashboardactionsComponent,
    ExecutionsDataGridComponent,
    LastExecutionComponent,
    HistoryComponent,
    UsernameComponent,
    WorkflowComponent,
    WorkflowHeaderComponent,
    WorkflowFormFieldComponent,
    WorkflowFormFieldLinkCheckComponent,
    WorkflowFormFieldMediaProcessComponent,
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
    EditorDropDownComponent,
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
    MaintenanceUtilsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CodemirrorModule,
    SharedModule
  ],
  providers: [
    TRANSLATION_PROVIDERS,
    provideHttpClient(
      withInterceptors([
        maintenanceInterceptor(maintenanceSettings),
        tokenInterceptor(),
        errorInterceptor()
      ])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
