import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../../_services';
import { Router } from '@angular/router';
import { User } from '../../_models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthenticationService]
})

export class HeaderComponent implements OnInit {

  constructor(
    private authentication: AuthenticationService,
    public router: Router) {}

  openSignIn = false;
  openSearch = false;
  searchfilter;

  @Input('loggedIn') loggedIn: boolean;

  ngOnInit() {
    this.openSignIn = false;
    this.searchfilter = 'All';
  }

  toggleSignInMenu() {
    this.openSignIn = !this.openSignIn;
  }

  toggleSearchMenu() {
    this.openSearch = !this.openSearch;
  }

  filterSearch(filter) {
    this.openSearch = false;
    this.searchfilter = filter;
  }

  gotoProfile() {
    this.openSignIn = false;
    this.router.navigate(['/profile']);
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  gotoLogin() {
    this.openSignIn = false;
    this.router.navigate(['/login']);
  }

  gotoRegister() {
    this.openSignIn = false;
    this.router.navigate(['/register']);
  }

  logOut() {
    this.authentication.logout();
    this.loggedIn = false;
    this.openSignIn = false;
    this.router.navigate(['/home']);
  }
}
