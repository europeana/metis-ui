import { Component, inject, Input } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClickAwareDirective, ModalConfirmService, SubscriptionManager, ModalConfirmComponent } from 'shared';
import { DatasetInfo, DatasetLog, DatasetProgress, DatasetStatus } from '../_models';
import { SandboxService } from '../_services';
import { RenameStatusPipe } from '../_translate/rename-status.pipe';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { NgIf, NgFor, NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss'],
  standalone: true,
  imports: [
    ClickAwareDirective,
    ModalConfirmComponent,
    NgIf,
    NgFor,
    NgClass,
    CopyableLinkItemComponent,
    NgTemplateOutlet,
    RenameStatusPipe
  ]
})
export class DatasetInfoComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly sandbox = inject(SandboxService);

  public DatasetStatus = DatasetStatus;
  public readonly ignoreClassesList = [
    'dataset-name',
    'ignore-close-click',
    'modal-wrapper',
    'top-level-nav'
  ];

  @Input() pushHeight = false;
  @Input() modalIdPrefix = '';

  _progressData?: DatasetProgress;

  @Input() set progressData(progressData: DatasetProgress | undefined) {
    this._progressData = progressData;

    this.showTick =
      !!progressData &&
      progressData['records-published-successfully'] &&
      progressData.status === DatasetStatus.COMPLETED;

    this.showCross =
      !!progressData &&
      (progressData.status === DatasetStatus.FAILED ||
        (progressData.status === DatasetStatus.COMPLETED &&
          progressData['records-published-successfully'] === false));

    this.noPublishedRecordAvailable =
      !!progressData &&
      progressData.status === DatasetStatus.COMPLETED &&
      !progressData['records-published-successfully'];

    this.datasetLogs = progressData ? progressData['dataset-logs'] : [];
    this.status = progressData ? progressData.status : DatasetStatus.HARVESTING_IDENTIFIERS;
    this.publishUrl = progressData ? progressData['portal-publish'] : '';
    this.processingError = progressData ? progressData['error-type'] : '';
  }

  get progressData(): DatasetProgress | undefined {
    return this._progressData;
  }

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
          this.datasetInfo = info;
        })
    );
  }

  datasetInfo?: DatasetInfo;
  datasetLogs: Array<DatasetLog> = [];
  fullInfoOpen = false;
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';
  noPublishedRecordAvailable: boolean;
  processingError?: string;
  publishUrl?: string;
  showCross = false;
  showTick = false;
  status?: DatasetStatus;

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
    this.subs.push(
      this.modalConfirms.open(this.modalIdPrefix + this.modalIdIncompleteData).subscribe()
    );
  }

  /**
   * showProcessingErrors
   * Shows the processing-error modal
   **/
  showProcessingErrors(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdProcessingErrors).subscribe());
  }
}
