import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService, DatasetsService } from '../_services';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';

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
  activeSet: string;
  isCollapsed: boolean = false;
  dataset: Dataset;
  user: User;
  userRole: string;
  editMode = false; // if not edit, then create

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

  loadTabComponent() {

    let viewContainerRef = this.datasetHost.viewContainerRef;
    viewContainerRef.clear();

    if (!this.getcurrentTab()) {return false; }

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getcurrentTab());
    let componentRef = viewContainerRef.createComponent(componentFactory);

  }

  getcurrentTab() {
    if (this.activeTab === 'new') {
      return DatasetformComponent;
    }
  }

  onSubmit() {
    console.log('submit');
  }

}
