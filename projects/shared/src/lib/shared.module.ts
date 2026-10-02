import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClickAwareDirective } from './_directives/click-aware.directive';

import { KeycloakSignoutCheckDirective } from './keycloak/_directives/keycloak-signout-check/keycloak-signout-check.directive';

import { MockModalConfirmService } from './_mocked/mocked-modal-confirm.service';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ClickService } from './_services/click.service';
import { ModalConfirmService } from './_services/modal-confirm.service';
import { ProtocolFieldSetComponent } from './form/protocol-field-set/protocol-field-set.component';
import { CheckboxComponent } from './form/checkbox/checkbox.component';
import { FileUploadComponent } from './form/file-upload/file-upload.component';
import { RadioButtonComponent } from './form/radio-button/radio-button.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ClickAwareDirective,
    CheckboxComponent,
    FileUploadComponent,
    KeycloakSignoutCheckDirective,
    ModalConfirmComponent,
    ProtocolFieldSetComponent,
    RadioButtonComponent
  ],
  providers: [ClickService, ModalConfirmService, MockModalConfirmService],
  exports: [
    CheckboxComponent,
    ClickAwareDirective,
    FileUploadComponent,
    KeycloakSignoutCheckDirective,
    ModalConfirmComponent,
    ProtocolFieldSetComponent,
    RadioButtonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
