import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [AuthenticationService]
})
export class DashboardComponent implements OnInit {

  user: {};
  userName: string;


  constructor(private authentication: AuthenticationService) {
    this.authentication.redirectLogin();
  }

  ngOnInit() {

  this.user = this.authentication.getUserInfo(1);
    this.userName = this.user['firstname'];

  }

}
