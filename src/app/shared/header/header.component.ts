import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../../_services';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { User } from '../../_models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthenticationService]
})

export class HeaderComponent implements OnInit {

  public currentUser: User;
  public loggedIn: boolean;

  isLoggedIn$: Observable<boolean>;

  constructor(
    private authentication: AuthenticationService,
    public router: Router) {
      this.currentUser = authentication.currentUser;
  }

  openSignIn = false;
  openSearch = false;
  searchfilter;

  ngOnInit() {
    this.openSignIn = false;
    this.searchfilter = 'All';
    this.isLoggedIn$.subscribe( (b) => this.loggedIn = b );
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

  logout() {
    this.authentication.logout();
    this.openSignIn = false;
    this.router.navigate(['/home']);
  }
}
