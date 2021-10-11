import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DataPollingComponent } from './data-polling/data-polling.component';
import { MockModalConfirmService } from './_mocked/MockedModalConfirm.service';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ModalConfirmService } from './_services/modal-confirm.service';
import { SubscriptionManager } from './subscription-manager/subscription.manager';
import { ProtocolFieldSetComponent } from './form/protocol-field-set/protocol-field-set.component';
import { FileUploadComponent } from './form/file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    DataPollingComponent,
    FileUploadComponent,
    FooterComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [ModalConfirmService, MockModalConfirmService],
  exports: [
    DataPollingComponent,
    FileUploadComponent,
    FooterComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
