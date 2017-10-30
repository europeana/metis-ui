import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

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

  openSignIn = false;
  openSearch = false;
  searchfilter;

  @Input('profileMenu') profileMenu: string;

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
    this.searchfilter = filter;
    this.openSearch = false;
  }

  gotoProfile() {
    this.authentication.redirectProfile();
    this.openSignIn = false;
  }

  logOut() {
    this.authentication.logOut();
    this.openSignIn = false;
  }
}
