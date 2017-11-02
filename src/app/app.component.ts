import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './_services';

@Component({
  providers: [AuthenticationService],
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  routerEventSubscription;
  isLessMargin = false;
  bodyClass: string;
  public loggedIn = false;

  constructor(
    private authentication: AuthenticationService,
    public router: Router) {
  }

  public ngOnInit(): void {
    this.routerEventSubscription = this.router.events.subscribe((event: any) => {
      if (this.router.isActive(event.url, false)) {
        this.loggedIn = this.authentication.validatedUser( );

        this.bodyClass = event.url.split('/')[1];

        this.isLessMargin = event.url.includes('home') || event.url === '/' || event.url.includes('dashboard');
      }
    });
  }

}
