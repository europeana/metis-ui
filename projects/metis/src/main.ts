import { enableProdMode, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
import { SharedModule } from 'shared';
import { environment } from './environments/environment';
import { maintenanceSettings } from './environments/maintenance-settings';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/routing';
import { errorInterceptor, tokenInterceptor } from './app/_services';
import { TRANSLATION_PROVIDERS } from './app/_translate';

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
        tokenInterceptor(),
        errorInterceptor()
      ])
    ),
    provideHttpClient(withInterceptorsFromDi())
  ]
}).catch((err) => console.log(err));
