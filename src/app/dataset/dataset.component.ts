import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Dataset,
  HarvestData,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PluginExecution,
  PreviewFilters,
  SimpleReportRequest,
  successNotification,
  Workflow,
  WorkflowExecution,
  workflowFormFieldConf
} from '../_models';
import { DatasetsService, DocumentTitleService, ErrorService, WorkflowService } from '../_services';

import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit, OnDestroy {
  constructor(
    private readonly datasets: DatasetsService,
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly documentTitleService: DocumentTitleService
  ) {}

  fieldConf = workflowFormFieldConf;
  activeTab = 'edit';
  datasetId: string;
  prevTab?: string;
  notification?: Notification;
  datasetIsLoading = true;
  harvestIsLoading = true;
  harvestSubscription: Subscription;
  workflowIsLoading = true;
  workflowSubscription: Subscription;
  lastExecutionIsLoading = true;
  lastExecutionSubscription: Subscription;
  isStarting = false;

  datasetData: Dataset;
  datasetName: string;

  workflowData?: Workflow;
  harvestPublicationData?: HarvestData;
  lastExecutionData?: WorkflowExecution;

  showPluginLog?: PluginExecution;
  tempXSLT?: string;
  previewFilters: PreviewFilters = {};

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

    this.route.params.subscribe((params) => {
      const { tab, id } = params;
      if (tab === 'new') {
        this.notification = successNotification('New dataset created! Id: ' + id);
        this.router.navigate([`/dataset/edit/${id}`]);
        return;
      }

      this.activeTab = tab;
      this.datasetId = id;
      if (this.activeTab !== 'preview' || this.prevTab !== 'mapping') {
        this.tempXSLT = undefined;
      }
      this.prevTab = this.activeTab;

      this.loadData();
    });
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

  /** ngOnDestroy
  /* invoke unsubscribe
  */
  ngOnDestroy(): void {
    this.unsubscribe([
      this.harvestSubscription,
      this.workflowSubscription,
      this.lastExecutionSubscription
    ]);
  }

  /** unsubscribe
  /* unsubscribe from subscriptions
  /* @param {array} subscriptions - array of subscriptions to unsubscribe from
  */
  unsubscribe(subscriptions: Array<Subscription>): void {
    subscriptions
      .filter((x) => x)
      .forEach((subscription: Subscription) => {
        subscription.unsubscribe();
      });
  }

  /** loadData
  /* subscribe to data services
  */
  loadData(): void {
    this.datasets.getDataset(this.datasetId, true).subscribe(
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
      }
    );

    // check for harvest data every x seconds
    this.unsubscribe([this.harvestSubscription]);
    const harvestTimer = timer(0, environment.intervalStatusMedium);
    this.harvestSubscription = harvestTimer.subscribe(() => {
      this.loadHarvestData();
    });

    // check workflow for every x seconds
    this.unsubscribe([this.workflowSubscription]);
    const workflowTimer = timer(0, environment.intervalStatusMedium);
    this.workflowSubscription = workflowTimer.subscribe(() => {
      this.loadWorkflow();
    });

    // check for last execution every x seconds
    this.unsubscribe([this.lastExecutionSubscription]);
    const executionsTimer = timer(0, environment.intervalStatus);
    this.lastExecutionSubscription = executionsTimer.subscribe(() => {
      this.loadLastExecution();
    });
  }

  /** datasetUpdated
  /* invoke load-data function
  */
  datasetUpdated(): void {
    this.loadData();
  }

  /** loadHarvestData
  /* invoke load-harvest-data function
  */
  loadHarvestData(): void {
    console.log('loadHarvestData...');
    this.workflows.getPublishedHarvestedData(this.datasetId).subscribe(
      (resultHarvest) => {
        this.harvestPublicationData = resultHarvest;
        this.harvestIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.harvestIsLoading = false;
        this.unsubscribe([this.harvestSubscription]);
      }
    );
  }

  /** loadWorkflow
  /* invoke load-workflow-data function
  */
  loadWorkflow(): void {
    this.workflows.getWorkflowForDataset(this.datasetId).subscribe(
      (workflow) => {
        this.workflowData = workflow;
        this.workflowIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.workflowIsLoading = false;
        this.unsubscribe([this.workflowSubscription]);
      }
    );
  }

  /** loadLastExecution
  /* invoke load-last-execution function
  */
  loadLastExecution(): void {
    this.workflows.getLastDatasetExecution(this.datasetId).subscribe(
      (execution) => {
        if (execution) {
          this.workflows.getReportsForExecution(execution);
        }

        this.lastExecutionData = execution;
        this.lastExecutionIsLoading = false;

        if (execution && !isWorkflowCompleted(execution)) {
          this.isStarting = false;
        }
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.unsubscribe([this.lastExecutionSubscription]);
        this.lastExecutionIsLoading = false;
      }
    );
  }

  /** startWorkflow
  /* - send request to start workflow
  *  - subscribe to harvest and execution data
  */
  startWorkflow(): void {
    this.isStarting = true;
    this.workflows.startWorkflow(this.datasetId).subscribe(
      () => {
        this.loadHarvestData();
        this.loadLastExecution();
        window.scrollTo(0, 0);
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.isStarting = false;
        window.scrollTo(0, 0);
      }
    );
  }
}
