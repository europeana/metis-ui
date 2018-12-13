import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

import { AuthenticationService, RedirectPreviousUrl } from '../../_services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    private redirectPreviousUrl: RedirectPreviousUrl,
  ) {}

  openSignIn = false;

  @Input() loggedIn: boolean;

  toggleSignInMenu(): void {
    this.openSignIn = !this.openSignIn;
  }

  logoLink(): string {
    return this.isLoggedIn() ? environment.afterLoginGoto : '/home';
  }

  userIconActive(): boolean {
    return this.router.isActive('/profile', false);
  }

  gotoProfile(): void {
    this.openSignIn = false;
    this.router.navigate(['/profile']);
  }

  gotoLogin(): void {
    this.openSignIn = false;
    this.router.navigate(['/signin']);
  }

  gotoRegister(): void {
    this.openSignIn = false;
    this.router.navigate(['/register']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logOut(): void {
    this.authentication.logout();
    this.redirectPreviousUrl.set(undefined);
    this.loggedIn = false;
    this.openSignIn = false;
    this.router.navigate(['/home']);
  }

  onClickedOutsideUser(_: Event): void {
    this.openSignIn = false;
  }
}
