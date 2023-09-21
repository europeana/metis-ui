import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
//import { NgChartsModule } from 'ng2-charts';
import {
  MAINTENANCE_INTERCEPTOR_SETTINGS,
  MaintenanceInterceptorProvider,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SharedModule } from 'shared';
import { AppRouteReuseStrategy } from './app-route-reuse-strategy';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextCopyDirective } from './_directives';
import {
  FormatHarvestUrlPipe,
  FormatLicensePipe,
  FormatTierDimensionPipe,
  HighlightMatchPipe,
  RenameStatusPipe,
  RenameStepPipe
} from './_translate';
import { CopyableLinkItemComponent } from './copyable-link-item';
import { DatasetInfoComponent } from './dataset-info';
import { DatasetContentSummaryComponent } from './dataset-content-summary';
//import { PieComponent } from './chart/pie';
import { FooterComponent } from './footer';
import { GridPaginatorComponent } from './grid-paginator';
import { HomeComponent } from './home';
import { HttpErrorsComponent } from './http-errors';
import { NavigationOrbsComponent } from './navigation-orbs';
import { PopOutComponent } from './pop-out';
import { ProblemViewerComponent } from './problem-viewer';
import { ProgressTrackerComponent } from './progress-tracker';
import { RecordReportComponent } from './record-report';
import { UploadComponent } from './upload';
import { SandboxNavigatonComponent } from './sandbox-navigation';
import { maintenanceSettings } from '../environments/maintenance-settings';

@NgModule({
  declarations: [
    AppComponent,
    TextCopyDirective,
    CopyableLinkItemComponent,
    DatasetInfoComponent,
    DatasetContentSummaryComponent,
    //PieComponent,
    FooterComponent,
    GridPaginatorComponent,
    HomeComponent,
    FormatHarvestUrlPipe,
    FormatLicensePipe,
    FormatTierDimensionPipe,
    HighlightMatchPipe,
    HttpErrorsComponent,
    NavigationOrbsComponent,
    PopOutComponent,
    ProblemViewerComponent,
    ProgressTrackerComponent,
    RecordReportComponent,
    RenameStatusPipe,
    RenameStepPipe,
    UploadComponent,
    SandboxNavigatonComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaintenanceUtilsModule,
//    NgChartsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy
    },
    MaintenanceInterceptorProvider,
    {
      provide: MAINTENANCE_INTERCEPTOR_SETTINGS,
      useValue: maintenanceSettings
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
