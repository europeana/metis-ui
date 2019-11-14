import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthenticationService, RedirectPreviousUrl } from '../../_services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly redirectPreviousUrl: RedirectPreviousUrl
  ) {}

  openSignIn = false;

  @Input() loggedIn: boolean;

  /** toggleSignInMenu
  /* toggles the visibility of the sign-in menu
  */
  toggleSignInMenu(): void {
    this.openSignIn = !this.openSignIn;
  }

  /** logoLink
  /* return a url depending on whether logged in
  */
  logoLink(): string {
    return this.isLoggedIn() ? environment.afterLoginGoto : '/home';
  }

  /** userIconActive
  /* return whether the /profile route is active
  */
  userIconActive(): boolean {
    return this.router.isActive('/profile', false);
  }

  /** gotoProfile
  /* redirect to profile
  */
  gotoProfile(): void {
    this.openSignIn = false;
    this.router.navigate(['/profile']);
  }

  /** gotoLogin
  /* redirect to signin
  */
  gotoLogin(): void {
    this.openSignIn = false;
    this.router.navigate(['/signin']);
  }

  /** gotoRegister
  /* redirect to register
  */
  gotoRegister(): void {
    this.openSignIn = false;
    this.router.navigate(['/register']);
  }

  /** isLoggedIn
  /* return if logged in
  */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /** logOut
  /* - log out
  *  - redirect to home
  */
  logOut(): void {
    this.authentication.logout();
    this.redirectPreviousUrl.set(undefined);
    this.loggedIn = false;
    this.openSignIn = false;
    this.router.navigate(['/home']);
  }

  /** onClickedOutsideUser
  /* set flag to hide sign-in
  */
  onClickedOutsideUser(_: Event): void {
    this.openSignIn = false;
  }
}
