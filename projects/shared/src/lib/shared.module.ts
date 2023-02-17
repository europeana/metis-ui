import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DataPollingComponent } from './data-polling/data-polling.component';
import { ClickAwareDirective } from './_directives/click-aware.directive';
import { MockModalConfirmService } from './_mocked/mocked-modal-confirm.service';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ClickService } from './_services/click.service';
import { ModalConfirmService } from './_services/modal-confirm.service';
import { SubscriptionManager } from './subscription-manager/subscription.manager';
import { ProtocolFieldSetComponent } from './form/protocol-field-set/protocol-field-set.component';
import { FileUploadComponent } from './form/file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    ClickAwareDirective,
    DataPollingComponent,
    FileUploadComponent,
    FooterComponent,
    ModalConfirmComponent,
    SubscriptionManager,
    ProtocolFieldSetComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [ClickService, ModalConfirmService, MockModalConfirmService],
  exports: [
    ClickAwareDirective,
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
