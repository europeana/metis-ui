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

  public isShowingLog = false;

  constructor(private authentication: AuthenticationService,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /* onNotifyShowLogStatus
    opens/closes the log messages 
  */
  onNotifyShowLogStatus(message):void {
    this.isShowingLog = message;
  }


}
