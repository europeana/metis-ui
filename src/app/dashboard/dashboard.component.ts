import { Component, OnInit } from '@angular/core';
import { AuthenticationService, NotificationsService } from '../_services';
import { User, Notification } from '../_models';

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

  constructor(private authentication: AuthenticationService,
              private notify: NotificationsService) {
  }

  ngOnInit() {
    this.user = this.authentication.currentUser;
    this.userName = this.user ? this.user.firstName : '';
    this.notifications = this.notify.getNotifications();
  }

}
