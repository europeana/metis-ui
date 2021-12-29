import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SharedModule } from 'shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationOrbsComponent } from './navigation-orbs';
import { ProgressTrackerComponent } from './progress-tracker';
import { RecordReportComponent } from './record-report';
import { WizardComponent } from './wizard';

@NgModule({
  declarations: [
    AppComponent,
    NavigationOrbsComponent,
    ProgressTrackerComponent,
    RecordReportComponent,
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
