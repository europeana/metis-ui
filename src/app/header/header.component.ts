import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router }   from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthenticationService]
})

export class HeaderComponent implements OnInit {

  constructor(
    private authentication: AuthenticationService, 
    public router: Router) {
  }

  openSignIn: boolean = false;

  @Input('profilemenu') profileMenu: string; 
  
  ngOnInit() {
    this.openSignIn = false; 
  }

  toggleSignInMenu() {
    if (this.openSignIn) {
      this.openSignIn = false;
    } else {
      this.openSignIn = true;
    }
  }

  gotoProfile() {
    this.authentication.redirectProfile();
  }

  logOut() {
    this.authentication.logOut();  
  }


}
