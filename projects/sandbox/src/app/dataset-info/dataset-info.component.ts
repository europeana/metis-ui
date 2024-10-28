import { DecimalPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickAwareDirective,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import {
  DatasetInfo,
  DatasetLog,
  DatasetProgress,
  DatasetStatus,
  DebiasInfo,
  DebiasState
} from '../_models';
import { MatomoService, SandboxService } from '../_services';
import { RenameStatusPipe } from '../_translate';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { DebiasComponent } from '../debias';

@Component({
  selector: 'sb-dataset-info',
  templateUrl: './dataset-info.component.html',
  styleUrls: ['./dataset-info.component.scss'],
  standalone: true,
  imports: [
    ClickAwareDirective,
    DebiasComponent,
    DecimalPipe,
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
  private readonly matomo = inject(MatomoService);

  public DatasetStatus = DatasetStatus;
  public DebiasState = DebiasState;
  public readonly ignoreClassesList = [
    'dataset-name',
    'ignore-close-click',
    'modal-wrapper',
    'top-level-nav'
  ];

  @Input() pushHeight = false;
  @Input() modalIdPrefix = '';

  @ViewChild('modalDebias') modalDebias: ModalConfirmComponent;
  @ViewChild('cmpDebias') cmpDebias: DebiasComponent;

  canRunDebias: boolean;
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
    this.publishUrl = progressData ? progressData['portal-publish'] : undefined;
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
    this.canRunDebias = false;

    if (this.modalConfirms.isOpen(this.modalIdPrefix + this.modalIdDebias)) {
      this.modalDebias.close(true);
    }

    this.checkIfCanRunDebias();

    this.subs.push(
      this.sandbox
        .getDatasetInfo(datasetId, this.status !== DatasetStatus.COMPLETED)
        .subscribe((info: DatasetInfo) => {
          this.datasetInfo = info;
        })
    );
    this.canRunDebias = false;
  }

  datasetInfo?: DatasetInfo;
  datasetLogs: Array<DatasetLog> = [];
  fullInfoOpen = false;
  modalIdDebias = 'confirm-modal-debias';
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  modalIdProcessingErrors = 'confirm-modal-processing-error';
  noPublishedRecordAvailable: boolean;
  processingError?: string;
  publishUrl?: string;
  showCross = false;
  showTick = false;
  status?: DatasetStatus;

  /**
   * checkIfCanRunDebias
   * Sets this.canRunDebias according to debias info call result
   **/
  checkIfCanRunDebias(): void {
    this.subs.push(
      this.sandbox.getDebiasInfo(this.datasetId).subscribe((info: DebiasInfo) => {
        this.canRunDebias = info.state === DebiasState.READY;
      })
    );
  }

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

  /**
   * trackViewPublished
   * track clicks on the published-records link
   **/
  trackViewPublished(): void {
    this.matomo.trackNavigation(['external', 'published-records']);
  }

  /**
   * runOrShowDebiasReport
   *
   * @param { boolean } run - flags action
   **/
  runOrShowDebiasReport(run: boolean): void {
    if (run) {
      this.subs.push(
        this.sandbox.runDebiasReport(this.datasetId).subscribe(() => {
          this.canRunDebias = false;
        })
      );
    } else {
      this.cmpDebias.startPolling();
      this.subs.push(this.modalConfirms.open(this.modalIdPrefix + this.modalIdDebias).subscribe());
    }
  }
}
