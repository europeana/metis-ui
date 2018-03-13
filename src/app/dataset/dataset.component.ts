import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { StringifyHttpError } from '../_helpers';

import { AuthenticationService, DatasetsService, RedirectPreviousUrl, WorkflowService, ErrorService, TranslateService } from '../_services';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';
import { HistoryComponent } from './history/history.component';
import { MappingComponent } from './mapping/mapping.component';
import { PreviewComponent } from './preview/preview.component';

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
    private router: Router,
    private route: ActivatedRoute,
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private RedirectPreviousUrl: RedirectPreviousUrl,
    private errors: ErrorService, 
    private translate: TranslateService) { }

  @ViewChild(DatasetDirective) datasetHost: DatasetDirective;

  activeTab: string = 'new';
  isCollapsed: boolean = true;
  showLog: boolean = false;
  user: User;
  errorMessage: string;
  successMessage: string;
  
  public isShowingLog = false;
  public datasetData; 
  public activeSet: string;
  public workflowData;

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
      if (this.activeSet) {
        this.returnDataset(+params['id']);
      } else {
        this.loadTabComponent();
      }
    });

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        this.isCollapsed = true;
      }
    );

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** returnDataset
  /*  returns all dataset information based on identifier
  /* @param {number} id - dataset identifier
  */
  returnDataset(id) {
    this.datasets.getDataset(id).subscribe(result => {
      this.datasetData = result;
      this.loadTabComponent();
    }, (err: HttpErrorResponse) => {
        let error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages 
  /* @param {boolean} message - show log yes/no
  */
  onNotifyShowLogStatus(message: boolean):void {
    this.isShowingLog = message;
  }

  /** loadTabComponent
  /*  loads the content within the placeholder
  */
  loadTabComponent() {
    if (!this.getcurrentTab()) {return false; }

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getcurrentTab().component);
    let viewContainerRef = this.datasetHost.viewContainerRef;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.datasetData = this.getcurrentTab().data;
     
    this.successMessage = this.datasets.getDatasetMessage();
  }

  /** getcurrentTab
  /*  returns the components that will be used in the component placeholder within a tab
  /*  based on currently active tab
  */
  getcurrentTab() {
    if (this.activeTab === 'new' || this.activeTab === 'edit') {
      return new datasetTab(DatasetformComponent, this.datasetData);
    } else if (this.activeTab === 'log') {
      return new datasetTab(HistoryComponent, this.datasetData);
    } else  if (this.activeTab === 'mapping') {
      return new datasetTab(MappingComponent, {});
    } else  if (this.activeTab === 'preview') {
      return new datasetTab(PreviewComponent, this.datasetData);
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
