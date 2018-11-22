import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { StringifyHttpError } from '../_helpers';
import { environment } from '../../environments/environment';
import { timer, Subscription } from 'rxjs';

import { AuthenticationService, DatasetsService, WorkflowService, ErrorService, TranslateService } from '../_services';

import { User } from '../_models';
import { Dataset } from '../_models/dataset';
import { Workflow } from '../_models/workflow';
import { HarvestData } from '../_models/harvest-data';
import { WorkflowExecution } from '../_models/workflow-execution';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})

export class DatasetComponent implements OnInit {

  constructor(private authentication: AuthenticationService,
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  activeTab = 'new';
  prevTab: string | undefined;
  showLog = false;
  user: User | null;
  errorMessage?: string;
  successMessage?: string;
  executionsSubscription: Subscription;
  workflowSubscription: Subscription;
  harvestSubscription: Subscription;

  public isShowingLog: boolean;
  public datasetData: Dataset;
  public activeSet: string;
  public workflowData?: Workflow;
  public harvestPublicationData?: HarvestData;
  public lastExecutionData?: WorkflowExecution;

  /** ngOnInit
  /* set current user
  /* if id is known, go to update dataset form, else new
  /* subscribe to workflow changes
  /* set translation language
  */
  ngOnInit(): void {

    this.user = this.authentication.currentUser;

    this.route.params.subscribe(params => {
      this.prevTab = this.activeTab;
      this.activeTab = params['tab']; //if no tab defined, default tab is 'new'
      this.activeSet = params['id']; // if no id defined, let's create a new dataset

      if (this.activeTab === 'preview' && this.prevTab === 'mapping') {
        this.datasets.setTempXSLT(this.datasets.getTempXSLT());
      } else {
        this.datasets.setTempXSLT(null);
      }
      this.successMessage = this.datasets.getDatasetMessage();

      this.returnDataset(this.activeSet);
    });

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    if (this.executionsSubscription) { this.executionsSubscription.unsubscribe(); }
    if (this.workflowSubscription) { this.workflowSubscription.unsubscribe(); }
  }

  /** returnDataset
  /*  returns all dataset information based on identifier
  /* @param {string} id - dataset identifier
  */
  returnDataset(id?: string): void {
    if (!id) {
      return;
    }

    this.datasets.getDataset(id, true).subscribe(result => {
      this.datasetData = result;
      // check for harvest data
      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(resultHarvest => {
        this.harvestPublicationData = resultHarvest;
      });

      // check for last execution every x seconds
      if (this.executionsSubscription || !this.authentication.validatedUser()) { this.executionsSubscription.unsubscribe(); }
      const executionsTimer = timer(0, environment.intervalStatus);
      this.executionsSubscription = executionsTimer.subscribe(t => {
        this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(execution => {
          this.lastExecutionData = execution;
        }, (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.errorMessage = `${StringifyHttpError(error)}`;
          this.executionsSubscription.unsubscribe();
        });
      });


      // check workflow for every x seconds
      if (this.workflowSubscription) { this.workflowSubscription.unsubscribe(); }
      const workflowTimer = timer(0, environment.intervalStatusMedium);
      this.workflowSubscription = workflowTimer.subscribe(t => {
        this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflow => {
          this.workflowData = workflow;
        }, (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.errorMessage = `${StringifyHttpError(error)}`;
          this.workflowSubscription.unsubscribe();
        });
      });
    }, (err: HttpErrorResponse) => {
        if (this.executionsSubscription) { this.executionsSubscription.unsubscribe(); }
        const error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages
  /* @param {boolean} message - show log yes/no
  */
  onNotifyShowLogStatus(message: boolean): void {
    this.isShowingLog = message;
  }

  /** clickOutsideMessage
  /*  click outside message to close it
  /* @param {Event} e - event, optional
  */
  clickOutsideMessage(e?: Event): void {
    this.errorMessage = undefined;
    this.successMessage = undefined;
    this.datasets.clearDatasetMessage();
  }
}
