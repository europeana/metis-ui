import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, TranslateService } from '../_services';
import { User, Notification } from '../_models';
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
  datasets;

  constructor(private authentication: AuthenticationService,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.translate.use('en');
  }


}
