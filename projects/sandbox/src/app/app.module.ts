import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SharedModule } from 'shared';
import { AppRouteReuseStrategy } from './app-route-reuse-strategy';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextCopyDirective } from './_directives';
import { FormatHarvestUrlPipe, RenameStepPipe } from './_translate';
import { CopyableLinkItemComponent } from './copyable-link-item';
import { DatasetInfoComponent } from './dataset-info';
import { FooterComponent } from './footer';
import { HomeComponent } from './home';
import { HttpErrorsComponent } from './http-errors';
import { NavigationOrbsComponent } from './navigation-orbs';
import { PopOutComponent } from './pop-out';
import { ProblemViewerComponent } from './problem-viewer';
import { ProgressTrackerComponent } from './progress-tracker';
import { RecordReportComponent } from './record-report';
import { UploadComponent } from './upload';
import { WizardComponent } from './wizard';

@NgModule({
  declarations: [
    AppComponent,
    TextCopyDirective,
    CopyableLinkItemComponent,
    DatasetInfoComponent,
    FooterComponent,
    HomeComponent,
    FormatHarvestUrlPipe,
    HttpErrorsComponent,
    NavigationOrbsComponent,
    PopOutComponent,
    ProblemViewerComponent,
    ProgressTrackerComponent,
    RecordReportComponent,
    RenameStepPipe,
    UploadComponent,
    WizardComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule {}
