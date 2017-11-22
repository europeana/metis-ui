import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { User } from '../_models';
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

  constructor(private authentication: AuthenticationService) {
  }

  ngOnInit() {
    this.user = this.authentication.currentUser;
    this.userName = this.user ? this.user.firstName : '';
  }

  gotoZoho() {
    window.location.href = environment.links.gotoZoho;
  }

}
