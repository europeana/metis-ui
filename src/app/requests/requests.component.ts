import { Component, OnInit } from '@angular/core';
import { Router }   from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { UserrequestsService } from '../services/userrequests.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  providers: [AuthenticationService, UserrequestsService]
})
export class RequestsComponent implements OnInit {

   constructor(
   	private authentication: AuthenticationService,
	  private userrequests: UserrequestsService,
	  public router: Router) { }
  
  pendingusers: {};

  ngOnInit() {

  	this.authentication.redirectLogin();

    this.pendingusers = this.userrequests.getPendingRequests();

  }

}
