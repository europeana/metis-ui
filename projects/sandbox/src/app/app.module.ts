import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
import { MatomoConsentMode, MatomoModule } from 'ngx-matomo-client';
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
import { CookiePolicyComponent } from './cookie-policy';
import { CopyableLinkItemComponent } from './copyable-link-item';
import { DatasetInfoComponent } from './dataset-info';
import { DatasetContentSummaryComponent } from './dataset-content-summary';
import { PieComponent } from './chart/pie';
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
import { PrivacyPolicyComponent } from './privacy-policy';
import { SandboxNavigatonComponent } from './sandbox-navigation';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { matomoSettings } from '../environments/matomo-settings';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaintenanceUtilsModule,
    NgChartsModule,
    ReactiveFormsModule,
    SharedModule,
    MatomoModule.forRoot({
      requireConsent: MatomoConsentMode.COOKIE,
      scriptUrl: matomoSettings.matomoScriptUrl,
      trackers: [
        {
          trackerUrl: matomoSettings.matomoTrackerUrl,
          siteId: matomoSettings.matomoSiteId
        }
      ],
      enableLinkTracking: true
    }),
    TextCopyDirective,
    CookiePolicyComponent,
    CopyableLinkItemComponent,
    DatasetInfoComponent,
    DatasetContentSummaryComponent,
    PieComponent,
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
    PrivacyPolicyComponent,
    SandboxNavigatonComponent
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy
    },
    provideHttpClient(withInterceptors([maintenanceInterceptor(maintenanceSettings)])),
    FormatTierDimensionPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
