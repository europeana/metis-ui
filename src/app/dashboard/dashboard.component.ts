import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, NotificationsService, DatasetsService } from '../_services';
import { User, Notification, Dataset } from '../_models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [AuthenticationService]
})
export class DashboardComponent implements OnInit {

  user: User;
  userName: string;
  notifications: Notification[];
  datasets: Dataset[];

  constructor(private authentication: AuthenticationService,
              private router: Router,
              private notify: NotificationsService,
              private dataset: DatasetsService) {
  }

  ngOnInit() {
    this.user = this.authentication.currentUser;
    this.userName = this.user ? this.user.firstName : '';
    this.notifications = this.notify.getNotifications();
    this.datasets = this.dataset.getDatasets();
  }

  gotoDataset(dataset: Dataset) {
    this.router.navigate(['/dataset/detail', '' + dataset.id]);
  }

}
