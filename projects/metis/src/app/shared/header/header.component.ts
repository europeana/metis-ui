import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import Keycloak from 'keycloak-js';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClickAwareDirective, SubscriptionManager } from 'shared';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../_translate/translate.pipe';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [ClickAwareDirective, RouterLink, NgIf, SearchComponent, RouterLinkActive, TranslatePipe]
})
export class HeaderComponent extends SubscriptionManager implements OnInit {
  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {
    super();
  }

  openSignIn = false;
  searchString: string;
  keycloak = inject(Keycloak);

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
    if (this.keycloak.idToken) {
      this.router.navigate(['/search'], {
        queryParams: { searchString: encodeURIComponent(event.trim()) }
      });
    } else {
      this.router.navigate(['/home']);
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
    this.keycloak.login({ redirectUri: window.location.origin + environment.afterLoginGoto });
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
    return !!this.keycloak.idToken;
  }

  /** logOut
  /* - log out
  *  - redirect to home
  */
  logOut(): void {
    this.keycloak.logout({ redirectUri: window.location.origin + '/home' });
  }

  /** onClickedOutsideUser
  /* set flag to hide sign-in
  */
  onClickedOutsideUser(_: Event): void {
    this.openSignIn = false;
  }
}
