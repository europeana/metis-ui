import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

import { AuthenticationService, RedirectPreviousUrl } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private redirectPreviousUrl: RedirectPreviousUrl,
    private translate: TranslateService,
  ) {}

  openSignIn = false;
  openSearch = false;
  searchfilter: string;

  @Input() loggedIn: boolean;

  /** ngOnInit
  /* init for this component
  /* close signin menu, wehen open
  /* set search to default 'All'
  /* set translation language
  */
  ngOnInit(): void {
    this.openSignIn = false;
    this.searchfilter = 'All';

    this.translate.use('en');
  }

  /** toggleSignInMenu
  /* toggle sign in menu
  */
  toggleSignInMenu(): void {
    this.openSignIn = !this.openSignIn;
  }

  /** toggleSearchMenu
  /* toggle search menu
  */
  toggleSearchMenu(): void {
    this.openSearch = !this.openSearch;
  }

  /** filterSearch
  /* open search filter
  /* @param {string} filter - selected filter
  */
  filterSearch(filter: string): void {
    this.openSearch = false;
    this.searchfilter = filter;
  }

  logoLink(): string {
    return this.isLoggedIn() ? environment.afterLoginGoto : '/home';
  }

  /** gotoProfile
  /* go to profile page
  */
  gotoProfile(): void {
    this.openSignIn = false;
    this.router.navigate(['/profile']);
  }

  /** gotoLogin
  /* go to login(=signin) page
  */
  gotoLogin(): void {
    this.openSignIn = false;
    this.router.navigate(['/signin']);
  }

  /** gotoRegister
  /* go to registration page
  */
  gotoRegister(): void {
    this.openSignIn = false;
    this.router.navigate(['/register']);
  }

  /** isLoggedIn
  /* get logged in status of a user
  */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /** logOut
  /* logout user
  /* redirect to homepage
  */
  logOut(): void {
    this.authentication.logout();
    this.redirectPreviousUrl.set(undefined);
    this.loggedIn = false;
    this.openSignIn = false;
    this.router.navigate(['/home']);
  }

  /** onClickedOutsideUser
  /* close sign in menu after clicking outside
  /* @param {object} e - event, optional
  */
  onClickedOutsideUser(_: Event): void {
    this.openSignIn = false;
  }

  /** onClickedOutsideSearch
  /* close search menu after clicking outside
  /* @param {object} e - event, optional
  */
  onClickedOutsideSearch(_: Event): void {
    this.openSearch = false;
  }
}
