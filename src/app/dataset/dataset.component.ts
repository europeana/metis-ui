import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { StringifyHttpError } from '../_helpers';
import { environment } from '../../environments/environment';
import {timer as observableTimer, Observable} from 'rxjs';

import { AuthenticationService, DatasetsService, RedirectPreviousUrl, WorkflowService, ErrorService, TranslateService } from '../_services';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';
import { HistoryComponent } from './history/history.component';
import { MappingComponent } from './mapping/mapping.component';
import { PreviewComponent } from './preview/preview.component';
import { WorkflowComponent } from './workflow/workflow.component';

import { datasetTab } from './datasettab';

import { User } from '../_models';

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
    private RedirectPreviousUrl: RedirectPreviousUrl,
    private errors: ErrorService, 
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  @ViewChild(DatasetDirective) datasetHost: DatasetDirective;

  activeTab: string = 'new';
  isCollapsed: boolean = true;
  showLog: boolean = false;
  user: User;
  errorMessage: string;
  successMessage: string;
  subscription;
  subscriptionWorkflow;
  intervalTimer: number = environment.intervalStatus;
  tabsLoaded: boolean = false;

  public isShowingLog;
  public datasetData; 
  public activeSet: string;
  public workflowData;
  public harvestPublicationData;
  public lastExecutionData;

  /** ngOnInit
  /* set current user
  /* if id is known, go to update dataset form, else new
  /* subscribe to workflow changes
  /* set translation language
  */ 
  ngOnInit() {
    this.user = this.authentication.currentUser;

    this.route.params.subscribe(params => {
      this.activeTab = params['tab']; //if no tab defined, default tab is 'new'
      this.activeSet = params['id']; // if no id defined, let's create a new dataset
      this.returnDataset(this.activeSet);

      if (this.tabsLoaded) {
        this.loadTabComponent(); 
      }
    });

    if (!this.tabsLoaded && !this.workflowData) {
      this.loadTabComponent(); 
      this.tabsLoaded = true;
    }

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        this.isCollapsed = true;
      }
    );

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.subscriptionWorkflow) { this.subscriptionWorkflow.unsubscribe(); }
  }

  /** returnDataset
  /*  returns all dataset information based on identifier
  /* @param {string} id - dataset identifier
  */
  returnDataset(id?: string) {

    if (!id) { 
      this.loadTabComponent(); 
      return false;
    }
    
    this.datasets.getDataset(id).subscribe(result => {
      this.datasetData = result;
      // check for harvest data
      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(result => {
        this.harvestPublicationData = result;
      });

      // check for last execution every x seconds
      if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
      let timer = observableTimer(0, this.intervalTimer);
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
  onNotifyShowLogStatus(message):void {
    this.isShowingLog = message;
  }

  /** loadTabComponent
  /*  loads the content within the placeholder
  */
  loadTabComponent() {

    console.log('loadTabComponent', this.getCurrentTab());

    if (!this.getCurrentTab()) {return false; }

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getCurrentTab().component);
    let viewContainerRef = this.datasetHost.viewContainerRef;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.datasetData = this.getCurrentTab().data;
    componentRef.instance.workflowData = this.getCurrentTab().data2;
    
    this.successMessage = this.datasets.getDatasetMessage();
  }

  /** getCurrentTab
  /*  returns the components that will be used in the component placeholder within a tab
  /*  based on currently active tab
  */
  getCurrentTab() {
    if (this.activeTab === 'new' || this.activeTab === 'edit') {
      return new datasetTab(DatasetformComponent, this.datasetData, this.workflowData);
    } else if (this.activeTab === 'log') {
      return new datasetTab(HistoryComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'mapping') {
      return new datasetTab(MappingComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'preview') {
      return new datasetTab(PreviewComponent, this.datasetData, this.workflowData);
    } else  if (this.activeTab === 'workflow') {
      return new datasetTab(WorkflowComponent, this.datasetData, this.workflowData);
    } 
  }

  /** clickOutsideMessage
  /*  click outside message to close it
  /* @param {any} e - event, optional
  */
  clickOutsideMessage(e?) {
    this.errorMessage = undefined;
    this.successMessage = undefined;
  }
}
