import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';
import { DatasetInfo, DatasetLog } from '../_models';
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
    'ignore-close-click',
    'modal-wrapper',
    'top-level-nav'
  ];

  _datasetId: string;

  get datasetId(): string {
    return this._datasetId;
  }

  @Input() set datasetId(datasetId: string) {
    this._datasetId = datasetId;
    this.subs.push(
      this.sandbox
        .getDatasetInfo(datasetId, !this.processingComplete)
        .subscribe((info: DatasetInfo) => {
          this.datasetInfo = info;
        })
    );
  }

  @Input() datasetInfo: DatasetInfo;
  @Input() datasetLogs: Array<DatasetLog> = [];
  @Input() processingComplete: boolean;
  @Input() publishUrl?: string;
  @Input() processingError: string;

  @Input() enableDynamicInfo = false;
  @Input() pushHeight = false;
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
   * showDatasetIssues
   * Shows the warning / errors modal
   **/
  showDatasetIssues(): void {
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
