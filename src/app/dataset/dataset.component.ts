import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { environment } from '../../environments/environment';
import { Dataset } from '../_models/dataset';
import { HarvestData } from '../_models/harvest-data';
import { httpErrorNotification, Notification, successNotification } from '../_models/notification';
import { ReportRequest } from '../_models/report';
import { Workflow } from '../_models/workflow';
import { PluginExecution, WorkflowExecution } from '../_models/workflow-execution';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';
import { TranslateService } from '../_translate';

export interface PreviewFilters {
  execution?: WorkflowExecution;
  plugin?: string;
}

export interface ProcessingInfo {
  totalProcessed: number;
  currentPluginName: string;
}

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent implements OnInit, OnDestroy {
  constructor(
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

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

  datasetData: Dataset;
  workflowData?: Workflow;
  harvestPublicationData?: HarvestData;
  lastExecutionData?: WorkflowExecution;

  showPluginLog?: PluginExecution;
  tempXSLT?: string;
  previewFilters: PreviewFilters = {};
  processingInfo?: ProcessingInfo;
  reportRequest?: ReportRequest;

  ngOnInit(): void {
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

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    if (this.harvestSubscription) {
      this.harvestSubscription.unsubscribe();
    }
    if (this.workflowSubscription) {
      this.workflowSubscription.unsubscribe();
    }
    if (this.lastExecutionSubscription) {
      this.lastExecutionSubscription.unsubscribe();
    }
  }

  loadData(): void {
    this.datasets.getDataset(this.datasetId, true).subscribe(
      (result) => {
        this.datasetData = result;
        this.datasetIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.datasetIsLoading = false;
      },
    );

    // check for harvest data every x seconds
    if (this.harvestSubscription) {
      this.harvestSubscription.unsubscribe();
    }
    const harvestTimer = timer(0, environment.intervalStatusMedium);
    this.harvestSubscription = harvestTimer.subscribe(() => {
      this.loadHarvestData();
    });

    // check workflow for every x seconds
    if (this.workflowSubscription) {
      this.workflowSubscription.unsubscribe();
    }
    const workflowTimer = timer(0, environment.intervalStatusMedium);
    this.workflowSubscription = workflowTimer.subscribe(() => {
      this.loadWorkflow();
    });

    // check for last execution every x seconds
    if (this.lastExecutionSubscription) {
      this.lastExecutionSubscription.unsubscribe();
    }
    const executionsTimer = timer(0, environment.intervalStatus);
    this.lastExecutionSubscription = executionsTimer.subscribe(() => {
      this.loadLastExecution();
    });
  }

  datasetUpdated(): void {
    this.loadData();
  }

  loadHarvestData(): void {
    this.workflows.getPublishedHarvestedData(this.datasetId).subscribe(
      (resultHarvest) => {
        this.harvestPublicationData = resultHarvest;
        this.harvestIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.harvestSubscription.unsubscribe();
        this.harvestIsLoading = false;
      },
    );
  }

  loadWorkflow(): void {
    this.workflows.getWorkflowForDataset(this.datasetId).subscribe(
      (workflow) => {
        this.workflowData = workflow;
        this.workflowIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.workflowSubscription.unsubscribe();
        this.workflowIsLoading = false;
      },
    );
  }

  loadLastExecution(): void {
    this.workflows.getLastDatasetExecution(this.datasetId).subscribe(
      (execution) => {
        this.lastExecutionData = execution;
        this.lastExecutionIsLoading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.lastExecutionSubscription.unsubscribe();
        this.lastExecutionIsLoading = false;
      },
    );
  }

  startWorkflow(): void {
    this.workflows.startWorkflow(this.datasetId).subscribe(
      () => {
        this.loadHarvestData();
        this.loadLastExecution();
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
      },
    );
  }
}
