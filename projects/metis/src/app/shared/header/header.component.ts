import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { environment } from '../../../environments/environment';
import { AuthenticationService, RedirectPreviousUrl } from '../../_services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent extends SubscriptionManager implements OnInit {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly redirectPreviousUrl: RedirectPreviousUrl
  ) {
    super();
  }

  openSignIn = false;
  searchString: string;

  @Input() loggedIn: boolean;

  /** ngOnInit
  /* - set searchString variable to URI-decoded query parameter
  */
  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params) => {
        const q = params.searchString;
        if (q !== undefined) {
          this.searchString = decodeURIComponent(q.trim());
        }
      })
    );
  }

  executeSearch(event: string): void {
    if (this.authentication.validatedUser()) {
      this.router.navigate(['/search'], {
        queryParams: { searchString: encodeURIComponent(event.trim()) }
      });
    } else {
      this.router.navigate(['/signin']);
    }
  }

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
    return this.router.isActive('/profile', {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
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
