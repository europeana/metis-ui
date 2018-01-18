import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { StringifyHttpError, convertDate } from '../_helpers';

import { AuthenticationService, DatasetsService, RedirectPreviousUrl } from '../_services';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';
import { HistoryComponent } from './history/history.component';
import { MappingComponent } from './mapping/mapping.component';
import { PreviewComponent } from './preview/preview.component';
import { QualityassuranceComponent } from './qualityassurance/qualityassurance.component';

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
    private componentFactoryResolver: ComponentFactoryResolver,
    private RedirectPreviousUrl: RedirectPreviousUrl) { }

  @ViewChild(DatasetDirective) datasetHost: DatasetDirective;

  activeTab: string = 'new';
  isCollapsed: boolean = false;
  showLog: boolean = false;
  user: User;
  errorMessage: string;
  successMessage: string;
  updatedDate;
  
  public isShowingLog = false;
  public datasetData; 
  public activeSet: string;

  public workflowData;
  public activeWorkflow;

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

  }

  /* returnDataset
    returns all dataset information based on identifier
  */
  returnDataset(id) {

    this.datasets.getDataset(id).subscribe(result => {
      this.datasetData = result;
      this.loadTabComponent();
      this.updatedDate = convertDate(this.datasetData.updatedDate);
    },
      (err: HttpErrorResponse) => {

        this.errorMessage = `Not able to load this dataset: ${StringifyHttpError(err)}`;

        if (err.status === 401 || err.error.errorMessage === 'Wrong access token') {
          this.RedirectPreviousUrl.set(this.router.url);
          this.authentication.logout();
          this.router.navigate(['/login']);
        }

    });

  }

  /* onNotifyWorkflow
    the active workflow changes, notify all relevant components
  */
  onNotifyWorkflow(message:any):void {
    console.log('onNotifyWorkflow');
  }

  /* onNotifyShowLogStatus
    opens/closes the log messages 
  */
  onNotifyShowLogStatus(message:boolean):void {
    this.isShowingLog = message;
  }

  /* loadTabComponent
    loads the content within the placeholder
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

  /* getcurrentTab
    returns the components that will be used in the component placeholder within a tab
    based on currently active tab
  */
  getcurrentTab() {
    if (this.activeTab === 'new') {
      return new datasetTab(DatasetformComponent, this.datasetData);
    } else if (this.activeTab === 'log') {
      return new datasetTab(HistoryComponent, this.datasetData);
    } else  if (this.activeTab === 'mapping') {
      return new datasetTab(MappingComponent, {});
    } else  if (this.activeTab === 'preview') {
      return new datasetTab(PreviewComponent, {});
    } else  if (this.activeTab === 'dataquality') {
      return new datasetTab(QualityassuranceComponent, {});
    }
  }

}
