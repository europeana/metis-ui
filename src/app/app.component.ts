import { Component, OnInit, EventEmitter} from '@angular/core';
import { Router, UrlTree }   from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AuthenticationService]
})

export class AppComponent implements OnInit {

  constructor(
    private authentication: AuthenticationService, 
    public router: Router) {
  }

  routerEventSubscription;
  isHome: boolean = false;
  loggedIn: boolean = false;

  ngOnInit(): void {
    
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
