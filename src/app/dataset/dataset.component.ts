import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService, DatasetsService } from '../_services';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';
import { HistoryComponent } from './history/history.component';
import { MappingComponent } from './mapping/mapping.component';
import { PreviewComponent } from './preview/preview.component';
import { QualityassuranceComponent } from './qualityassurance/qualityassurance.component';

import { datasetTab } from './datasettab';

import { Dataset, User } from '../_models';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  providers: [AuthenticationService]
})

export class DatasetComponent implements OnInit {

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private datasets: DatasetsService,
    private componentFactoryResolver: ComponentFactoryResolver) { }

  @ViewChild(DatasetDirective) datasetHost: DatasetDirective;

  activeTab: string = 'new';
  isCollapsed: boolean = true;
  showLog: boolean = false;
  user: User;
  userRole: string;
  editMode = false; // if not edit, then create
  
  public isShowingLog = false;
  public dataset: Dataset; 
  public activeSet: string;

  ngOnInit() {

    this.user = this.authentication.currentUser;
    this.userRole = this.user.accountRole;

    this.route.params.subscribe(params => {

      this.activeTab = params['tab']; //if no tab defined, default tab is 'new'
      this.activeSet = params['id']; // if no id defined, let's create a new dataset

      if (this.activeSet) {
        this.dataset = this.datasets.getDataset(+params['id']);
      } else {
        // create new dataset
      }

      this.loadTabComponent();

    });

  }

  onNotifyShowLogStatus(message:boolean):void {
    this.isShowingLog = message;
  }

  loadTabComponent() {

    if (!this.getcurrentTab()) {return false; }

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getcurrentTab().component);

    let viewContainerRef = this.datasetHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.dataset = this.getcurrentTab().data;

  }

  getcurrentTab() {
    if (this.activeTab === 'new') {
      return new datasetTab(DatasetformComponent, {});
    } else if (this.activeTab === 'log') {
      return new datasetTab(HistoryComponent, this.dataset);
    } else  if (this.activeTab === 'mapping') {
      return new datasetTab(MappingComponent, {});
    } else  if (this.activeTab === 'preview') {
      return new datasetTab(PreviewComponent, {});
    } else  if (this.activeTab === 'dataquality') {
      return new datasetTab(QualityassuranceComponent, {});
    }
  }

  onSubmit() {
    console.log('submit');
  }

}
