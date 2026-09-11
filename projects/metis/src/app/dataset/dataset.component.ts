import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoadAnimationComponent } from '../load-animation';
import { createPoller, DataPoller, httpErrorNotification, successNotification } from '../_helpers';
import {
  Dataset,
  HarvestData,
  isWorkflowCompleted,
  Notification,
  PluginExecution,
  PreviewFilters,
  PublicationFitness,
  ReportRequest,
  ReportRequestWithData,
  Workflow,
  WorkflowExecution
} from '../_models';
import { DatasetsService, DocumentTitleService, WorkflowService } from '../_services';
import { TranslatePipe } from '../_translate';
import { NotificationComponent } from '../shared';

import { WorkflowComponent, WorkflowHeaderComponent } from './workflow';
import { HistoryComponent } from './history';
import { PreviewComponent } from './preview';
import { MappingComponent } from './mapping';
import { DepublicationComponent } from './depublication';
import { DatasetformComponent } from './datasetform';
import { TabHeadersComponent } from './tabheader';
import { LastExecutionComponent } from './lastexecution';
import { ActionbarComponent } from './actionbar';
import { GeneralinfoComponent } from './generalinfo';
import { ReportSimpleComponent } from './reportsimple';

@Component({
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  imports: [
    LoadAnimationComponent,
    ReportSimpleComponent,
    NotificationComponent,
    GeneralinfoComponent,
    ActionbarComponent,
    LastExecutionComponent,
    TabHeadersComponent,
    WorkflowHeaderComponent,
    DatasetformComponent,
    WorkflowComponent,
    DepublicationComponent,
    MappingComponent,
    PreviewComponent,
    HistoryComponent,
    TranslatePipe
  ]
})
export class DatasetComponent implements OnInit {
  private readonly datasets = inject(DatasetsService);
  private readonly workflows = inject(WorkflowService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentTitleService = inject(DocumentTitleService);
  private readonly destroyRef = inject(DestroyRef);

  activeTab = 'edit';
  datasetId: string;
  prevTab?: string;
  notification?: Notification;
  datasetIsLoading = true;
  harvestIsLoading = true;
  workflowIsLoading = true;
  lastExecutionIsLoading = true;
  isStarting = false;

  datasetData: Dataset;
  datasetName: string;

  workflowData?: Workflow;
  harvestPublicationData?: HarvestData;
  lastExecutionData?: WorkflowExecution;

  showPluginLog?: PluginExecution;
  tempXSLT?: string;
  previewFilters: PreviewFilters = { baseFilter: {} };
  pollingRefresh: DataPoller;

  reportLoading: boolean;
  reportRequest: ReportRequestWithData = {};

  readonly workflowFormRef = viewChild(WorkflowComponent);
  readonly workflowHeaderRef = viewChild(WorkflowHeaderComponent);
  readonly scrollToTopAnchor = viewChild<ElementRef<HTMLElement>>('scrollToTopAnchor');

  formInitialised(workflowForm: UntypedFormGroup): void {
    if (this.workflowHeaderRef() && this.workflowFormRef()) {
      this.workflowHeaderRef()?.setWorkflowForm(workflowForm);
      this.workflowFormRef()?.onHeaderSynchronised(this.workflowHeaderRef()?.elRef().nativeElement);
    } else {
      const initDelayTimer = timer(50).subscribe({
        next: () => {
          this.formInitialised(workflowForm);
          initDelayTimer.unsubscribe();
        }
      });
    }
  }

  /** ngOnInit
  /* - set the document title
  *  - re-route the page to the edit page if creating a new dataset
  *  - set the active tab
  *  - load the dataset data
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Dataset');
    this.activatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (params) => {
        const { tab, id } = params;
        if (tab === 'new') {
          this.notification = successNotification('New dataset created! Id: ' + id);
          this.router.navigate([`/dataset/edit/${id}`]);
        } else {
          this.activeTab = tab;
          this.datasetId = id;
          if (this.activeTab !== 'preview' || this.prevTab !== 'mapping') {
            this.tempXSLT = undefined;
          }
          this.prevTab = this.activeTab;
          if (!this.pollingRefresh) {
            this.beginPolling();
            this.loadData();
          }
        }
      }
    });
  }

  beginPolling(): void {
    const harvestPoller = createPoller({
      interval: environment.intervalStatusMedium,
      destroyRef: this.destroyRef,
      fnServiceCall: () => this.workflows.getPublishedHarvestedData(this.datasetId),
      fnDistinctValues: (prev: HarvestData, curr: HarvestData) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      },
      fnDataProcess: (resultHarvest: HarvestData): void => {
        this.harvestPublicationData = resultHarvest;
        this.harvestIsLoading = false;
      },
      fnOnError: (err: HttpErrorResponse): void => {
        this.notification = httpErrorNotification(err);
        this.harvestIsLoading = false;
      }
    });

    const workflowPoller = createPoller({
      interval: environment.intervalStatusMedium,
      destroyRef: this.destroyRef,
      fnServiceCall: () => this.workflows.getWorkflowForDataset(this.datasetId),
      fnDataProcess: (workflow: Workflow): void => {
        this.workflowData = workflow;
        this.workflowIsLoading = false;
      },
      fnOnError: (err: HttpErrorResponse): void => {
        this.notification = httpErrorNotification(err);
        this.workflowIsLoading = false;
      }
    });

    createPoller({
      interval: environment.intervalStatus,
      destroyRef: this.destroyRef,
      fnServiceCall: () => {
        this.lastExecutionIsLoading = false;
        return this.workflows.getLastDatasetExecution(this.datasetId);
      },
      fnDistinctValues: (previous, current) => {
        return JSON.stringify(previous) === JSON.stringify(current);
      },
      fnDataProcess: (execution: WorkflowExecution | undefined): void => {
        if (execution) {
          this.processLastExecutionData(execution);
        }
      },
      fnOnError: (err: HttpErrorResponse): void => {
        this.notification = httpErrorNotification(err);
      }
    });

    this.pollingRefresh = {
      next: (): void => {
        workflowPoller.next();
        harvestPoller.next();
      }
    };
  }

  /** setReportMsg
  /* sets the message for the reportMsg
  /* loads the report
  */
  setReportMsg(req: ReportRequest): void {
    this.reportRequest = req;

    if (req.taskId && req.topology) {
      this.reportLoading = true;

      this.workflows
        .getReport(req.taskId, req.topology)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (report) => {
            if (report?.errors && report?.errors.length) {
              this.reportRequest.errors = report?.errors;
            } else {
              this.reportRequest.message = 'Report is empty.';
            }
            this.reportLoading = false;
          },
          error: (err: HttpErrorResponse) => {
            this.notification = httpErrorNotification(err);
            this.reportLoading = false;
          }
        });
    }
  }

  /** clearReport
  /* - clear the reportRequest object
  */
  clearReport(): void {
    if (this.reportRequest) {
      this.reportRequest = {};
    }
  }

  /** returnToTop
  /* call native scrollIntoView method on the page anchor
  */
  returnToTop(): void {
    this.scrollToTopAnchor()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  /** setLinkCheck
  /* call setLinkCheck on the workflow form reference
  */
  setLinkCheck(linkCheckIndex: number): void {
    this.workflowFormRef()?.setLinkCheck(linkCheckIndex);
  }

  /** loadData
  /* subscribe to data services
  */
  loadData(): void {
    createPoller({
      interval: environment.intervalStatus,
      destroyRef: this.destroyRef,
      fnServiceCall: () => this.datasets.getDataset(this.datasetId, true),
      fnDataProcess: (result) => {
        this.datasetData = result;
        this.datasetName = result.datasetName;
        this.datasetIsLoading = false;
        this.documentTitleService.setTitle(this.datasetName || 'Dataset');
      },
      fnOnError: (err: HttpErrorResponse): void => {
        this.notification = httpErrorNotification(err);
        this.datasetIsLoading = false;
      }
    });
  }

  /** processLastExecutionData
   * invoke load-last-execution function
   * assign clone to lastExecutionData to maintain distinct (until changed) pipeline data
   * @param {WorkflowExecution} loadedExecution - loaded execution data
   */
  processLastExecutionData(loadedExecution: WorkflowExecution): void {
    const execution = structuredClone(loadedExecution);
    this.workflows.getReportsForExecution(execution);
    this.lastExecutionData = execution;
    if (this.isStarting && !isWorkflowCompleted(execution)) {
      this.isStarting = false;
    }
  }

  /** startWorkflow
  /* - send request to start workflow
  *  - subscribe to harvest and execution data
  */
  startWorkflow(): void {
    this.isStarting = true;
    this.workflows.startWorkflow(this.datasetId).subscribe({
      next: () => {
        this.pollingRefresh.next();
        window.scrollTo(0, 0);
      },
      error: (err: HttpErrorResponse) => {
        this.notification = httpErrorNotification(err);
        this.isStarting = false;
        window.scrollTo(0, 0);
      }
    });
  }

  /** publicationFitnessWarningAndClass
  /* - return object literal specifying the relevant warning message and css class for the given status
  /* @param {string} status - the publication status
  */
  publicationFitnessWarningAndClass(
    status?: string
  ): { warning: string; cssClass: string } | undefined {
    if (status === PublicationFitness.FIT) {
      return undefined;
    }
    let cssClass = '';
    let warning = '';
    if (status === PublicationFitness.UNFIT) {
      warning = 'datasetUnpublishableBanner';
      cssClass = 'unfit-to-publish';
    } else if (status === PublicationFitness.PARTIALLY_FIT) {
      warning = 'datasetPartiallyUnpublishableBanner';
      cssClass = 'partial-fitness';
    }
    return {
      warning: warning,
      cssClass: cssClass
    };
  }
}
