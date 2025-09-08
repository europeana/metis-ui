import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MatomoConsentMode, MatomoModule } from 'ngx-matomo-client';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
import { provideKeycloakAngular, SharedModule } from 'shared';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { environment } from './environments/environment';
import { keycloakSettings } from './environments/keycloak-settings';
import { matomoSettings } from './environments/matomo-settings';
import { maintenanceSettings } from './environments/maintenance-settings';
import { FormatTierDimensionPipe } from './app/_translate';
import { AppRoutingModule } from './app/app-routing.module';
import { AppRouteReuseStrategy } from './app/app-route-reuse-strategy';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AppRoutingModule,
      BrowserModule,
      FormsModule,
      MaintenanceUtilsModule,
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
      })
    ),
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy
    },
    provideCharts(withDefaultRegisterables()),
    FormatTierDimensionPipe,
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClient(
      withInterceptors([maintenanceInterceptor(maintenanceSettings), includeBearerTokenInterceptor])
    ),
    provideKeycloakAngular(keycloakSettings)
  ]
}).catch((err) => console.error(err));
