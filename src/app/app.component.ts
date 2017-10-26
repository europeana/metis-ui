import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

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
        if (this.authentication.validatedUser()) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
        
        this.bodyClass = event.url.split('/')[1];

        if (event.url.includes('home') || event.url === '/' || event.url.includes('dashboard')) {
          this.isLessMargin = true;
        } else {
          this.isLessMargin = false;
        }
      }
    });

  }
}
