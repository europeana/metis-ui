import { Component, OnInit } from '@angular/core';
import { AuthenticationService, TranslateService } from '../_services';
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
  datasets;

  public isShowingLog = false;

  constructor(private authentication: AuthenticationService,
              private translate: TranslateService) {
  }

  /** ngOnInit
  /* init of this component
  /* set translation language 
  */
  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages 
  /* @param {any} message - message to display in log modal
  */
  onNotifyShowLogStatus(message):void {
    this.isShowingLog = message;
  }

}
