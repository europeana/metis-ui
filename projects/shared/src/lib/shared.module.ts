import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { DataPollingComponent } from './data-polling';
import { SubscriptionManager } from './subscription-manager';

import { ProtocolFieldSetComponent } from './form/protocol-field-set';
import { FileUploadComponent } from './form/file-upload';

@NgModule({
  declarations: [
    DataPollingComponent,
    FileUploadComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  exports: [
    DataPollingComponent,
    FileUploadComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ]
})
export class SharedModule {}
