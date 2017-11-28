import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services';

@Component({
  templateUrl: './logout.component.html',
  providers: [AuthenticationService]
})
export class LogoutComponent implements OnInit {

  constructor(private authentication: AuthenticationService,
              private router: Router ) {}

  ngOnInit() {
    this.authentication.logout();
    this.router.navigate(['/']);
  }
}
