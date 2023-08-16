import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DataPollingComponent } from './data-polling/data-polling.component';
import { ClickAwareDirective } from './_directives/click-aware.directive';
import { MockModalConfirmService } from './_mocked/mocked-modal-confirm.service';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ClickService } from './_services/click.service';
import { RemoteEnvService } from './_services/remote-env.service';
import { ModalConfirmService } from './_services/modal-confirm.service';
import { SubscriptionManager } from './subscription-manager/subscription.manager';
import { ProtocolFieldSetComponent } from './form/protocol-field-set/protocol-field-set.component';
import { CheckboxComponent } from './form/checkbox/checkbox.component';
import { FileUploadComponent } from './form/file-upload/file-upload.component';
import { RadioButtonComponent } from './form/radio-button/radio-button.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    ClickAwareDirective,
    CheckboxComponent,
    DataPollingComponent,
    FileUploadComponent,
    FooterComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent,
    RadioButtonComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [ClickService, ModalConfirmService, MockModalConfirmService, RemoteEnvService],
  exports: [
    CheckboxComponent,
    ClickAwareDirective,
    DataPollingComponent,
    FileUploadComponent,
    FooterComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent,
    RadioButtonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
