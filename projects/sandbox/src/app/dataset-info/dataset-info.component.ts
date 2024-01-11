import { formatDate } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';
import { DatasetInfo, DatasetLog, DatasetProgress, DatasetStatus } from '../_models';
import { SandboxService } from '../_services';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss']
})
export class DatasetInfoComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly sandbox = inject(SandboxService);

  public DatasetStatus = DatasetStatus;
  public formatDate = formatDate;
  public readonly ignoreClassesList = [
    'dataset-name',
    'ignore-close-click',
    'modal-wrapper',
    'top-level-nav'
  ];

  @Input() progressData: DatasetProgress;

  _datasetId: string;

  get datasetId(): string {
    return this._datasetId;
  }

  @Input() set datasetId(datasetId: string) {
    this._datasetId = datasetId;
    this.subs.push(
      this.sandbox
        .getDatasetInfo(datasetId, this.status !== DatasetStatus.COMPLETED)
        .subscribe((info: DatasetInfo) => {
          let creationDate = info['creation-date'];
          info['creation-date'] = formatDate(
            this.convertUTCDateToLocalDate(creationDate),
            'dd/MM/yyyy, HH:mm:ss',
            'en-GB'
          );
          this.datasetInfo = info;
        })
    );
  }

  datasetInfo?: DatasetInfo;

  @Input() datasetLogs: Array<DatasetLog> = [];
  @Input() status?: DatasetStatus;

  @Input() noPublishedRecordAvailable: boolean;
  @Input() showCross = false;
  @Input() showTick = false;

  @Input() publishUrl?: string;
  @Input() processingError: string;

  @Input() pushHeight = false;
  fullInfoOpen = false;

  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';

  /**
   * closeFullInfo
   * Sets this.fullInfoOpen to false
   **/
  closeFullInfo(): void {
    this.fullInfoOpen = false;
  }

  /**
   * showTooltipCompletedWithErrors
   * template utility to help set tooltip
   **/
  showTooltipCompletedWithErrors(): boolean {
    return !!(this.showCross && this.status && this.status === DatasetStatus.COMPLETED);
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

  /**
   * convertUTCDateToLocalDate
   * @param {string} dateIn
   **/
  convertUTCDateToLocalDate(dateIn: string) {
    const date = new Date(dateIn);
    const newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate;
  }
}
