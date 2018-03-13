import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService, RedirectPreviousUrl, TranslateService } from '../../_services';
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
    public router: Router, 
    private redirectPreviousUrl: RedirectPreviousUrl,
    private translate: TranslateService) {}

  openSignIn = false;
  openSearch = false;
  searchfilter;

  @Input('loggedIn') loggedIn: boolean;

  /** ngOnInit
  /* init for this component
  /* close signin menu, wehen open
  /* set search to default 'All'
  /* set translation language
  */
  ngOnInit() {
    this.openSignIn = false;
    this.searchfilter = 'All';

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
    
  }

  /** toggleSignInMenu
  /* toggle sign in menu
  */
  toggleSignInMenu() {
    this.openSignIn = !this.openSignIn;
  }

  /** toggleSearchMenu
  /* toggle search menu
  */
  toggleSearchMenu() {
    this.openSearch = !this.openSearch;
  }

  /** filterSearch
  /* open search filter
  /* @param {string} filter - selected filter
  */
  filterSearch(filter) {
    this.openSearch = false;
    this.searchfilter = filter;
  }

  /** gotoProfile
  /* go to profile page
  */
  gotoProfile() {
    this.openSignIn = false;
    this.router.navigate(['/profile']);
  }

  /** gotoLogin
  /* go to login page
  */
  gotoLogin() {
    this.openSignIn = false;
    this.router.navigate(['/login']);
  }

  /** gotoRegister
  /* go to registration page
  */
  gotoRegister() {
    this.openSignIn = false;
    this.router.navigate(['/register']);
  }

  /** isLoggedIn
  /* get logged in status of a user
  */
  isLoggedIn() {
    return this.loggedIn;
  }

  /** logOut
  /* logout user
  /* redirect to homepage
  */
  logOut() {
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
  onClickedOutsideUser(e?) {
    this.openSignIn = false;
  }

  /** onClickedOutsideSearch
  /* close search menu after clicking outside
  /* @param {object} e - event, optional
  */
  onClickedOutsideSearch(e?) {
    this.openSearch = false;
  }

}
