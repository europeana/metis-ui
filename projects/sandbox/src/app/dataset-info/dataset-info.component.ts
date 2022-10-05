import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';
import { DatasetInfo } from '../_models';
import { SandboxService } from '../_services';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss']
})
export class DatasetInfoComponent extends SubscriptionManager {
  public formatDate = formatDate;
  public readonly ignoreClassesList = [
    'dataset-name',
    'creation-date',
    'modal-wrapper',
    'top-level-nav'
  ];

  _datasetId: string;

  get datasetId(): string {
    return this._datasetId;
  }

  @Input() set datasetId(datasetId: string) {
    this._datasetId = datasetId;
    console.log('make call(' + datasetId + ')... ' + !!this.sandbox.requestDatasetInfo);
    this.sandbox.requestDatasetInfo(datasetId).subscribe((info: DatasetInfo) => {
      console.log('made call ' + info);
      this.datasetInfo = info;
    });
  }

  @Input() datasetInfo: DatasetInfo;
  @Input() processingComplete: boolean;
  @Input() publishUrl?: string;
  @Input() processingError: string;

  @Input() enableDynamicInfo = false;
  fullInfoOpen = false;

  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';

  constructor(
    private readonly modalConfirms: ModalConfirmService,
    private readonly sandbox: SandboxService
  ) {
    super();
  }

  /**
   * closeFullInfo
   * Sets this.fullInfoOpen to false
   **/
  closeFullInfo(): void {
    this.fullInfoOpen = false;
  }

  /**
   * toggleFullInfoOpen
   * Toggles this.fullInfoOpen
   **/
  toggleFullInfoOpen(): void {
    this.fullInfoOpen = !this.fullInfoOpen;
  }

  /**
   * showIncompleteDataWarning
   * Shows the incomplete-data warning modal
   **/
  showIncompleteDataWarning(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdIncompleteData).subscribe());
  }

  /**
   * showProcessingErrors
   * Shows the processing-error modal
   **/
  showProcessingErrors(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdProcessingErrors).subscribe());
  }
}
