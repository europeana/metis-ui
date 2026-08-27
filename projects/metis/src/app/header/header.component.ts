import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import Keycloak from 'keycloak-js';
import { ClickAwareDirective } from 'shared';
import { environment } from '../../environments/environment';
import { TranslatePipe } from '../_translate/translate.pipe';
import { SearchComponent } from '../shared/search/search.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    ClickAwareDirective,
    RouterLink,
    NgTemplateOutlet,
    SearchComponent,
    RouterLinkActive,
    TranslatePipe
  ]
})
export class HeaderComponent implements OnInit {
  // Services
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly keycloak = inject(Keycloak);

  // States transformed into Signals
  public readonly openSignIn = signal<boolean>(false);
  public readonly searchString = signal<string>('');
  public readonly urlProfile = signal<string>('');

  constructor() {
    this.urlProfile.set(this.keycloak.createAccountUrl({ redirectUri: window.location.href }));

    // Modern subscription streaming with auto-destruction lifecycle management
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const q = params.searchString;
      if (q !== undefined) {
        this.searchString.set(decodeURIComponent(q.trim()));
      }
    });
  }

  public ngOnInit(): void {
    // Left empty if there are no other sync operations, or can be removed if not needed by other features.
  }

  public executeSearch(event: string): void {
    if (this.keycloak.idToken) {
      this.router.navigate(['/search'], {
        queryParams: { searchString: encodeURIComponent(event.trim()) }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  public toggleSignInMenu(): void {
    this.openSignIn.update((current) => !current);
  }

  public logoLink(): string {
    return this.isLoggedIn() ? environment.afterLoginGoto : '/home';
  }

  public gotoLogin(): void {
    this.openSignIn.set(false);
    this.keycloak.login({ redirectUri: window.location.origin + environment.afterLoginGoto });
  }

  public isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  public logOut(): void {
    this.keycloak.logout({ redirectUri: window.location.origin + '/home' });
    this.openSignIn.set(false);
  }

  public onClickedOutsideUser(_: Event): void {
    this.openSignIn.set(false);
  }
}
