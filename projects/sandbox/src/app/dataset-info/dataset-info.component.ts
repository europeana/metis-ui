import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';
import { DatasetInfo } from '../_models';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss']
})
export class DatasetInfoComponent extends SubscriptionManager {
  public formatDate = formatDate;

  @Input() datasetInfo: DatasetInfo;
  @Input() processingComplete: boolean;
  @Input() publishUrl?: string;
  @Input() processingError: string;

  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  /**
   * showIncompleteDataWarning
   * Shows the incomplete-data warning modal
   **/
  showIncompleteDataWarning(): void {
    console.log('showIncompleteDataWarning');
    this.subs.push(this.modalConfirms.open(this.modalIdIncompleteData).subscribe());
  }

  /**
   * showProcessingErrors
   * Shows the processing-error modal
   **/
  showProcessingErrors(): void {
    console.log('showProcessingErrors');
    this.subs.push(this.modalConfirms.open(this.modalIdProcessingErrors).subscribe());
  }
}
