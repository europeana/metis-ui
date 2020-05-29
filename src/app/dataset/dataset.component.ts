import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { filter, merge, switchMap, tap } from 'rxjs/operators';
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

import { triggerDelay } from '../_helpers';
import { DatasetsService, DocumentTitleService, ErrorService, WorkflowService } from '../_services';
import { TranslateService } from '../_translate';

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
    private readonly documentTitleService: DocumentTitleService,
    private readonly translate: TranslateService
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

  polledHarvestData: Observable<HarvestData>;
  polledWorkflowData: Observable<Workflow>;
  polledLastExecutionData: Observable<WorkflowExecution>;

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
        this.beginPolling();
        this.loadData();
      }
    });
  }

  /** beginPolling
  /* sets up reactive polling
  */
  beginPolling(): void {
    let pushPollHarvest = 0;
    let pushPollWorkflow = 0;

    // stream for start-workflow click events
    this.pollingRefresh = new Subject();
    this.pollingRefresh.subscribe(() => {
      pushPollHarvest++;
      pushPollWorkflow++;
    });

    // poll for harvest data every 5 seconds after last result returned
    // - reset polling when user starts the workflow

    const loadTriggerHarvest = new BehaviorSubject(true);

    this.polledHarvestData = loadTriggerHarvest.pipe(
      merge(this.pollingRefresh),
      switchMap(() => {
        return this.workflows.getPublishedHarvestedData(this.datasetId);
      }),
      tap((_) => {
        triggerDelay.next({
          subject: loadTriggerHarvest,
          wait: environment.intervalStatusMedium,
          blockIf: () => pushPollHarvest > 0,
          blockThen: () => {
            return pushPollHarvest--;
          }
        });
      })
    );

    // poll for workflow data every 5 seconds after last result returned
    // - reset polling when user starts the workflow
    const loadTriggerWorkflow = new BehaviorSubject(true);
    this.polledWorkflowData = loadTriggerWorkflow.pipe(
      merge(this.pollingRefresh),
      switchMap(() => {
        return this.workflows.getWorkflowForDataset(this.datasetId);
      }),
      tap((_) => {
        triggerDelay.next({
          subject: loadTriggerWorkflow,
          wait: environment.intervalStatusMedium,
          blockIf: () => pushPollWorkflow > 0,
          blockThen: () => {
            pushPollWorkflow--;
          }
        });
      })
    );

    // poll for last execution data every 2.5 seconds after last result returned

    const loadTriggerLastExecution = new BehaviorSubject(true);
    this.polledLastExecutionData = loadTriggerLastExecution.pipe(
      switchMap(() => {
        this.lastExecutionIsLoading = false;
        return this.workflows.getLastDatasetExecution(this.datasetId);
      }),
      tap((_) => {
        triggerDelay.next({ subject: loadTriggerLastExecution, wait: environment.intervalStatus });
      }),
      filter((execution: WorkflowExecution | undefined) => execution !== undefined)
    ) as Observable<WorkflowExecution>;
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

    this.unsubscribe([
      this.harvestSubscription,
      this.workflowSubscription,
      this.lastExecutionSubscription
    ]);

    // subscribe to polledHarvestData

    this.harvestSubscription = this.polledHarvestData.subscribe(
      (resultHarvest: HarvestData) => {
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

    // subscribe to polledWorkflowData
    this.workflowSubscription = this.polledWorkflowData.subscribe(
      (workflow: Workflow) => {
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

    // check for last execution every x seconds
    this.lastExecutionSubscription = this.polledLastExecutionData.subscribe(
      (execution: WorkflowExecution) => {
        this.processLastExecutionData(execution);
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.unsubscribe([this.lastExecutionSubscription]);
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
    );
  }

  /** publicationFitnessWarning
  /* - return relevant warning message (or undefined) according to the status
  /* @param {string} status - the publication status
  */
  publicationFitnessWarning(status: string): string | undefined {
    if (status === PublicationFitness.UNFIT) {
      return this.translate.instant('datasetUnpublishableBanner');
    } else if (status === PublicationFitness.PARTIALLY_FIT) {
      return this.translate.instant('datasetPartiallyUnpublishableBanner');
    }
    return undefined;
  }
}
