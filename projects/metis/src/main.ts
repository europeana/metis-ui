import { enableProdMode, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
import { provideKeycloakAngular, SharedModule } from 'shared';
import { environment } from './environments/environment';
import { maintenanceSettings } from './environments/maintenance-settings';
import { keycloakSettings } from './environments/keycloak-settings';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/routing';
import { errorInterceptor } from './app/_services';
import { TRANSLATION_PROVIDERS } from './app/_translate';
import { includeBearerTokenInterceptor } from 'keycloak-angular';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      MaintenanceUtilsModule,
      ReactiveFormsModule,
      AppRoutingModule,
      CodemirrorModule,
      SharedModule
    ),
    TRANSLATION_PROVIDERS,
    provideHttpClient(
      withInterceptors([
        maintenanceInterceptor(maintenanceSettings),
        errorInterceptor(),
        includeBearerTokenInterceptor
      ])
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideKeycloakAngular(keycloakSettings)
  ]
}).catch((err) => console.log(err));
