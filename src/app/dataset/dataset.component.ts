import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

import { DatasetDirective } from './dataset.directive';
import { DatasetformComponent } from './datasetform/datasetform.component';

import { User } from '../_models/index';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  providers: [AuthenticationService]
})

export class DatasetComponent implements OnInit {

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private componentFactoryResolver: ComponentFactoryResolver) { }

  @ViewChild(DatasetDirective) datasetHost: DatasetDirective;

  activeTab: string;
  user: User;
  userRole: string;
  editMode = false; // if not edit, then create

  ngOnInit() {

    this.user = this.authentication.currentUser;
    this.userRole = this.user.accountRole;

    this.route.params.subscribe(params => {
      this.activeTab = params['tab'];
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
