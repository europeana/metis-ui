import { Component, OnInit } from '@angular/core';
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
    public router: Router) { }

  profileMenu;
  openSignIn: boolean = false;

  ngOnInit() {
    this.profileMenu = this.authentication.validatedUser();
  }

  toggleSignInMenu() {
    if (this.openSignIn) {
      this.openSignIn = false;
    } else {
      this.openSignIn = true;
    }
  }


}
