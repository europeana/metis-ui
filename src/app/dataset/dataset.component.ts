import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Dataset,
  HarvestData,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PluginExecution,
  PreviewFilters,
  PublicationFitness,
  SimpleReportRequest,
  successNotification,
  Workflow,
  WorkflowExecution,
  workflowFormFieldConf
} from '../_models';

import { DataPollingComponent } from '../data-polling';
import { DatasetsService, DocumentTitleService, ErrorService, WorkflowService } from '../_services';
import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent extends DataPollingComponent implements OnInit {
  constructor(
    private readonly datasets: DatasetsService,
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly documentTitleService: DocumentTitleService
  ) {
    super();
  }

  fieldConf = workflowFormFieldConf;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportErrors: any;
  reportMsg?: string;
  reportLoading: boolean;

  @ViewChild(WorkflowComponent) workflowFormRef: WorkflowComponent;

  @ViewChild(WorkflowHeaderComponent) workflowHeaderRef: WorkflowHeaderComponent;
  @ViewChild('scrollToTopAnchor') scrollToTopAnchor: ElementRef;

  formInitialised(workflowForm: FormGroup): void {
    if (this.workflowHeaderRef && this.workflowFormRef) {
      this.workflowHeaderRef.setWorkflowForm(workflowForm);
      this.workflowFormRef.onHeaderSynchronised(this.workflowHeaderRef.elRef.nativeElement);
    } else {
      const initDelayTimer = timer(50).subscribe(() => {
        this.formInitialised(workflowForm);
        initDelayTimer.unsubscribe();
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
      this.route.params.subscribe((params) => {
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
      })
    );
  }

  beginPolling(): void {
    const harvestRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<HarvestData> => {
        return this.workflows.getPublishedHarvestedData(this.datasetId);
      },
      (resultHarvest: HarvestData): void => {
        this.harvestPublicationData = resultHarvest;
        this.harvestIsLoading = false;
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.harvestIsLoading = false;
        return error;
      }
    ).getPollingSubject();

    const workflowRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<Workflow> => {
        return this.workflows.getWorkflowForDataset(this.datasetId);
      },
      (workflow: Workflow): void => {
        this.workflowData = workflow;
        this.workflowIsLoading = false;
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.workflowIsLoading = false;
        return error;
      }
    ).getPollingSubject();

    this.createNewDataPoller(
      environment.intervalStatus,
      (): Observable<WorkflowExecution> => {
        this.lastExecutionIsLoading = false;
        return this.workflows.getLastDatasetExecution(this.datasetId) as Observable<
          WorkflowExecution
        >;
      },
      (execution: WorkflowExecution): void => {
        this.processLastExecutionData(execution);
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        return error;
      }
    );

    // stream for start-workflow click events
    this.pollingRefresh = new Subject();
    this.subs.push(
      this.pollingRefresh.subscribe(() => {
        workflowRefresh.next(true);
        harvestRefresh.next(true);
      })
    );
  }

  /** setReportMsg
  /* sets the message for the reportMsg
  */
  setReportMsg(req: SimpleReportRequest): void {
    if (req.message) {
      this.reportMsg = req.message;
    }
    if (req.taskId && req.topology) {
      this.reportLoading = true;
      this.subs.push(
        this.workflows.getReport(req.taskId, req.topology).subscribe(
          (report) => {
            if (report && report.errors && report.errors.length) {
              this.reportErrors = report.errors;
            } else {
              this.reportMsg = 'Report is empty.';
            }
            this.reportLoading = false;
          },
          (err: HttpErrorResponse) => {
            const error = this.errors.handleError(err);
            this.notification = httpErrorNotification(error);
            this.reportLoading = false;
          }
        )
      );
    }
  }

  /** clearReport
  /* - clear the report message
  *  - clear the report errors
  */
  clearReport(): void {
    this.reportMsg = '';
    this.reportErrors = undefined;
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
      (result) => {
        this.datasetData = result;
        this.datasetName = result.datasetName;
        this.datasetIsLoading = false;
        this.documentTitleService.setTitle(this.datasetName || 'Dataset');
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
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
    if (execution) {
      this.workflows.getReportsForExecution(execution);
      this.lastExecutionData = execution;

      if (this.isStarting && !isWorkflowCompleted(execution)) {
        this.isStarting = false;
      }
    }
  }

  /** startWorkflow
  /* - send request to start workflow
  *  - subscribe to harvest and execution data
  */
  startWorkflow(): void {
    this.isStarting = true;
    this.subs.push(
      this.workflows.startWorkflow(this.datasetId).subscribe(
        () => {
          this.pollingRefresh.next(true);
          window.scrollTo(0, 0);
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
          this.isStarting = false;
          window.scrollTo(0, 0);
        }
      )
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
