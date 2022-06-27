import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SharedModule } from 'shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextCopyDirective } from './_directives';
import { CopyableLinkItemComponent } from './copyable-link-item';
import { HttpErrorsComponent } from './http-errors';
import { NavigationOrbsComponent } from './navigation-orbs';
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
    HttpErrorsComponent,
    NavigationOrbsComponent,
    ProblemViewerComponent,
    ProgressTrackerComponent,
    RecordReportComponent,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
