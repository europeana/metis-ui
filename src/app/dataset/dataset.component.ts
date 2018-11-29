import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { StringifyHttpError } from '../_helpers';
import { environment } from '../../environments/environment';
import { timer, Subscription } from 'rxjs';

import { AuthenticationService, DatasetsService, WorkflowService, ErrorService, TranslateService } from '../_services';

import { Dataset } from '../_models/dataset';
import { Workflow } from '../_models/workflow';
import { HarvestData } from '../_models/harvest-data';
import { PluginExecution, WorkflowExecution } from '../_models/workflow-execution';

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
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit, OnDestroy {

  constructor(private authentication: AuthenticationService,
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  activeTab = 'new';
  activeSet: string;
  prevTab?: string;
  errorMessage?: string;
  successMessage?: string;
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
  previewFilters: PreviewFilters;
  processingInfo?: ProcessingInfo;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.activeTab = params.tab;
      this.activeSet = params.id; // if no id defined, let's create a new dataset
      if (this.activeTab !== 'preview' || this.prevTab !== 'mapping') {
        this.tempXSLT = undefined;
      }
      this.prevTab = this.activeTab;

      if (this.activeSet) {
        this.loadData();
      } else {
        this.datasetData = {
          id: '',
          datasetId: '',
          ecloudDatasetId: '',
          datasetName: '',
          organizationId: '',
          organizationName: '',
          createdByUserId: '',
          createdDate: '',
          country: {
            enum: 'NL',
            isoCode: 'nl',
            name: 'Netherlands'
          }, language: {
            enum: 'EN',
            name: 'English'
          }
        };
        this.harvestIsLoading = false;
        this.workflowIsLoading = false;
        this.lastExecutionIsLoading = false;
      }
    });

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    if (this.harvestSubscription) { this.harvestSubscription.unsubscribe(); }
    if (this.workflowSubscription) { this.workflowSubscription.unsubscribe(); }
    if (this.lastExecutionSubscription) { this.lastExecutionSubscription.unsubscribe(); }
  }

  loadData(): void {
    if (!this.activeSet) {
      return;
    }

    this.datasets.getDataset(this.activeSet, true).subscribe(result => {
      this.datasetData = result;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });

    // check for harvest data every x seconds
    if (this.harvestSubscription || !this.authentication.validatedUser()) { this.harvestSubscription.unsubscribe(); }
    const harvestTimer = timer(0, environment.intervalStatusMedium);
    this.harvestSubscription = harvestTimer.subscribe(() => {
      this.loadHarvestData();
    });

    // check workflow for every x seconds
    if (this.workflowSubscription) { this.workflowSubscription.unsubscribe(); }
    const workflowTimer = timer(0, environment.intervalStatusMedium);
    this.workflowSubscription = workflowTimer.subscribe(() => {
      this.loadWorkflow();
    });

    // check for last execution every x seconds
    if (this.lastExecutionSubscription || !this.authentication.validatedUser()) { this.lastExecutionSubscription.unsubscribe(); }
    const executionsTimer = timer(0, environment.intervalStatus);
    this.lastExecutionSubscription = executionsTimer.subscribe(() => {
      this.loadLastExecution();
    });
  }

  loadHarvestData(): void {
    this.workflows.getPublishedHarvestedData(this.activeSet).subscribe(resultHarvest => {
      this.harvestPublicationData = resultHarvest;
      this.harvestIsLoading = false;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
      this.harvestSubscription.unsubscribe();
      this.harvestIsLoading = false;
    });
  }

  loadWorkflow(): void {
    this.workflows.getWorkflowForDataset(this.activeSet).subscribe(workflow => {
      this.workflowData = workflow;
      this.workflowIsLoading = false;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
      this.workflowSubscription.unsubscribe();
      this.workflowIsLoading = false;
    });
  }

  loadLastExecution(): void {
    this.workflows.getLastDatasetExecution(this.activeSet).subscribe(execution => {
      this.lastExecutionData = execution;
      this.lastExecutionIsLoading = false;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
      this.lastExecutionSubscription.unsubscribe();
      this.lastExecutionIsLoading = false;
    });
  }

  startWorkflow(): void {
    this.workflows.startWorkflow(this.datasetData.datasetId).subscribe(() => {
      this.loadHarvestData();
      this.loadLastExecution();
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  setSuccessMessage(successMessage: string | undefined): void {
    this.successMessage = successMessage;
  }

  setShowPluginLog(plugin: PluginExecution | undefined): void {
    this.showPluginLog = plugin;
  }

  setTempXSLT(tempXSLT: string | undefined): void {
    this.tempXSLT = tempXSLT;
  }

  setPreviewFilters(previewFilters: PreviewFilters): void {
    this.previewFilters = previewFilters;
  }

  setProcessingInfo(processingInfo: ProcessingInfo | undefined): void {
    this.processingInfo = processingInfo;
  }

  // click outside message to close it
  clickOutsideMessage(): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;
  }
}
