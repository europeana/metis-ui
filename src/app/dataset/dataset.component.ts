import { Component, OnInit, ViewChild, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { StringifyHttpError } from '../_helpers';
import { environment } from '../../environments/environment';
import { timer as observableTimer, Observable, Subscription } from 'rxjs';

import { AuthenticationService, DatasetsService, WorkflowService, ErrorService, TranslateService } from '../_services';

import { DatasetformComponent } from './datasetform/datasetform.component';
import { HistoryComponent } from './history/history.component';
import { MappingComponent } from './mapping/mapping.component';
import { PreviewComponent } from './preview/preview.component';
import { WorkflowComponent } from './workflow/workflow.component';

import { DatasetTab } from './datasettab';

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

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private errors: ErrorService,
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  @ViewChild('tabContainer', { read: ViewContainerRef })
  tabContainer: ViewContainerRef;

  activeTab: string | undefined = 'new';
  prevTab: string | undefined;
  showLog = false;
  user: User | null;
  errorMessage?: string;
  successMessage?: string;
  subscription: Subscription;
  subscriptionWorkflow: Subscription;
  intervalTimer: number = environment.intervalStatus;
  tabsLoaded = false;

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
      this.returnDataset(this.activeSet);

      if (this.tabsLoaded) {
        this.loadTabComponent();
      }
    });

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.subscriptionWorkflow) { this.subscriptionWorkflow.unsubscribe(); }
  }

  /** returnDataset
  /*  returns all dataset information based on identifier
  /* @param {string} id - dataset identifier
  */
  returnDataset(id?: string): void {
    if (!id) {
      this.loadTabComponent();
      return;
    }

    this.datasets.getDataset(id, true).subscribe(result => {
      this.datasetData = result;
      // check for harvest data
      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(resultHarvest => {
        this.harvestPublicationData = resultHarvest;
      });

      // check for last execution every x seconds
      if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
      const timer = observableTimer(0, this.intervalTimer);
      this.subscription = timer.subscribe(t => {
        this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(execution => {
          this.lastExecutionData = execution;
        }, (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.errorMessage = `${StringifyHttpError(error)}`;
          this.subscription.unsubscribe();
        });
      });


      // check workflow for every x seconds
      if (this.subscriptionWorkflow) { this.subscriptionWorkflow.unsubscribe(); }
      this.subscriptionWorkflow = timer.subscribe(t => {
        this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflow => {
          this.workflowData = workflow;
          if (this.workflowData && !this.tabsLoaded) {
            this.loadTabComponent();
            this.tabsLoaded = true;
          }
        }, (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.errorMessage = `${StringifyHttpError(error)}`;
          this.subscriptionWorkflow.unsubscribe();
        });
      });

      // no execution yet?
      if (!this.lastExecutionData && !this.workflowData) {
        this.loadTabComponent();
      }

    }, (err: HttpErrorResponse) => {
        if (this.subscription) { this.subscription.unsubscribe(); }
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

  /** loadTabComponent
  /*  loads the content within the placeholder
  */
  loadTabComponent(): void {

    if (!this.getCurrentTab()) {return; }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getCurrentTab()!.component);
    const viewContainerRef = this.tabContainer;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.datasetData = this.getCurrentTab()!.dataset;
    componentRef.instance.workflowData = this.getCurrentTab()!.workflow;

    this.successMessage = this.datasets.getDatasetMessage();

    if (this.activeTab === 'preview' && this.prevTab === 'mapping') {
      this.datasets.setTempXSLT(this.datasets.getTempXSLT());
    } else {
      this.datasets.setTempXSLT(null);
    }
  }

  /** getCurrentTab
  /*  returns the components that will be used in the component placeholder within a tab
  /*  based on currently active tab
  */
  getCurrentTab(): DatasetTab | undefined {
    if (this.activeTab === 'new' || this.activeTab === 'edit') {
      return new DatasetTab(DatasetformComponent, this.datasetData, this.workflowData);
    } else if (this.activeTab === 'log') {
      return new DatasetTab(HistoryComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'mapping') {
      return new DatasetTab(MappingComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'preview') {
      return new DatasetTab(PreviewComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'workflow') {
      return new DatasetTab(WorkflowComponent, this.datasetData, this.workflowData);
    } else {
      return undefined;
    }
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
