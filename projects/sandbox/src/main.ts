import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core'; // 👈 Use the precise Angular 20 API token name
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser'; // 👈 Dropped unused BrowserModule
import { provideRouter, RouteReuseStrategy, withComponentInputBinding } from '@angular/router';
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
import { AppRouteReuseStrategy } from './app/app-route-reuse-strategy';
import { AppComponent } from './app/app.component';
import { routes } from './app.routes';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([maintenanceInterceptor(maintenanceSettings), includeBearerTokenInterceptor])
    ),
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy
    },
    provideCharts(withDefaultRegisterables()),
    provideKeycloakAngular(keycloakSettings),
    FormatTierDimensionPipe,
    importProvidersFrom(
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
    )
  ]
}).catch((err) => console.error(err));
