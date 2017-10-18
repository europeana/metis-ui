import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router, UrlTree }   from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

@Component({
  providers: [AuthenticationService],  
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {

  routerEventSubscription;
  isHome: boolean = false;
  public loggedIn: boolean = false;

  constructor(
    private authentication: AuthenticationService,
    public router: Router) {
  }

  public ngOnInit(): void {
    this.routerEventSubscription = this.router.events.subscribe((event: any) => {
      if (this.router.isActive(event.url, false)) {
        if (this.authentication.validatedUser()) {
          this.loggedIn = true;
        }

        if (event.url.includes('home') || event.url === '/') {
          this.isHome = true;
        }
      }
    });

  }
}
