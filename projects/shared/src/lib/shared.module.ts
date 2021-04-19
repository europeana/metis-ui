import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DataPollingComponent } from './data-polling';
import { MockModalConfirmService } from './_mocked';
import { ModalConfirmComponent } from './modal-confirm';
import { ModalConfirmService } from './_services';
import { SubscriptionManager } from './subscription-manager';
import { ProtocolFieldSetComponent } from './form/protocol-field-set';
import { FileUploadComponent } from './form/file-upload';

@NgModule({
  declarations: [
    DataPollingComponent,
    FileUploadComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [ModalConfirmService, MockModalConfirmService],
  exports: [
    DataPollingComponent,
    FileUploadComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ]
})
export class SharedModule {}
