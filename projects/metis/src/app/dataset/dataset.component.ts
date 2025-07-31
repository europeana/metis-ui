import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, timer } from 'rxjs';

import { DataPollingComponent } from 'shared';
import { environment } from '../../environments/environment';
import { LoadAnimationComponent } from '../load-animation';
import { httpErrorNotification, successNotification } from '../_helpers';
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
import { DatasetlogComponent } from './datasetlog';
import { LastExecutionComponent } from './lastexecution';
import { ActionbarComponent } from './actionbar';
import { GeneralinfoComponent } from './generalinfo';
import { ReportSimpleComponent } from './reportsimple';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  imports: [
    NgIf,
    LoadAnimationComponent,
    ReportSimpleComponent,
    NotificationComponent,
    GeneralinfoComponent,
    ActionbarComponent,
    LastExecutionComponent,
    DatasetlogComponent,
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
export class DatasetComponent extends DataPollingComponent implements OnInit {
  private readonly datasets = inject(DatasetsService);
  private readonly workflows = inject(WorkflowService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentTitleService = inject(DocumentTitleService);

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
  pollingRefresh: Subject<boolean>;

  reportLoading: boolean;
  reportRequest: ReportRequestWithData = {};

  @ViewChild(WorkflowComponent) workflowFormRef: WorkflowComponent;

  @ViewChild(WorkflowHeaderComponent) workflowHeaderRef: WorkflowHeaderComponent;
  @ViewChild('scrollToTopAnchor') scrollToTopAnchor: ElementRef;

  formInitialised(workflowForm: UntypedFormGroup): void {
    if (this.workflowHeaderRef && this.workflowFormRef) {
      this.workflowHeaderRef.setWorkflowForm(workflowForm);
      this.workflowFormRef.onHeaderSynchronised(this.workflowHeaderRef.elRef.nativeElement);
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
    this.subs.push(
      this.activatedRoute.params.subscribe({
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
      })
    );
  }

  beginPolling(): void {
    const harvestRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<HarvestData> => {
        return this.workflows.getPublishedHarvestedData(this.datasetId);
      },
      (prev: HarvestData, curr: HarvestData) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      },
      (resultHarvest: HarvestData): void => {
        this.harvestPublicationData = resultHarvest;
        this.harvestIsLoading = false;
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        this.notification = httpErrorNotification(err);
        this.harvestIsLoading = false;
        return err;
      }
    ).getPollingSubject();

    const workflowRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<Workflow> => {
        return this.workflows.getWorkflowForDataset(this.datasetId);
      },
      false,
      (workflow: Workflow): void => {
        this.workflowData = workflow;
        this.workflowIsLoading = false;
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        this.notification = httpErrorNotification(err);
        this.workflowIsLoading = false;
        return err;
      }
    ).getPollingSubject();

    this.createNewDataPoller(
      environment.intervalStatus,
      (): Observable<WorkflowExecution | undefined> => {
        this.lastExecutionIsLoading = false;
        return this.workflows.getLastDatasetExecution(this.datasetId);
      },
      false,
      (execution: WorkflowExecution | undefined): void => {
        if (execution) {
          this.processLastExecutionData(execution);
        }
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        this.notification = httpErrorNotification(err);
        return err;
      }
    );

    // stream for start-workflow click events

    this.pollingRefresh = new Subject();
    this.subs.push(
      this.pollingRefresh.subscribe({
        next: () => {
          workflowRefresh.next(true);
          harvestRefresh.next(true);
        }
      })
    );
  }

  /** setReportMsg
  /* sets the message for the reportMsg
  /* loads the report
  */
  setReportMsg(req: ReportRequest): void {
    this.reportRequest = req;

    if (req.taskId && req.topology) {
      this.reportLoading = true;
      this.subs.push(
        this.workflows.getReport(req.taskId, req.topology).subscribe({
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
        })
      );
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
    this.scrollToTopAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  /** setLinkCheck
  /* call setLinkCheck on the workflow form reference
  */
  setLinkCheck(linkCheckIndex: number): void {
    this.workflowFormRef.setLinkCheck(linkCheckIndex);
  }

  /** loadData
  /* subscribe to data services
  */
  loadData(): void {
    this.createNewDataPoller(
      environment.intervalStatus,
      () => {
        return this.datasets.getDataset(this.datasetId, true);
      },
      false,
      (result) => {
        this.datasetData = result;
        this.datasetName = result.datasetName;
        this.datasetIsLoading = false;
        this.documentTitleService.setTitle(this.datasetName || 'Dataset');
      },
      (err: HttpErrorResponse) => {
        this.notification = httpErrorNotification(err);
        this.datasetIsLoading = false;
        return err;
      }
    );
  }

  /** processLastExecutionData
  /* invoke load-last-execution function
  /* @param {WorkflowExecution} execution - loaded data
  */
  processLastExecutionData(execution: WorkflowExecution): void {
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
    this.subs.push(
      this.workflows.startWorkflow(this.datasetId).subscribe({
        next: () => {
          this.pollingRefresh.next(true);
          window.scrollTo(0, 0);
        },
        error: (err: HttpErrorResponse) => {
          this.notification = httpErrorNotification(err);
          this.isStarting = false;
          window.scrollTo(0, 0);
        }
      })
    );
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
