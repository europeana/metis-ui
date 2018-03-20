import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, DatasetsService } from './_services';

@Component({
  providers: [AuthenticationService, DatasetsService],
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  title = 'Metis-UI';
  isLessMargin = false;
  bodyClass: string;
  public loggedIn = false;

  constructor(
    private authentication: AuthenticationService,
    public router: Router) {
  }

  /** ngOnInit
  /* init for this component
  /* watch router events
  /* check if user is logged in
  /* add a body class
  /* and margins
  */
  public ngOnInit(): void {    
    this.router.events.subscribe((event: any) => {
      if (!event.url) { return false; }
      if (this.router.isActive(event.url, false)) {
        this.loggedIn = this.authentication.validatedUser( );

        this.bodyClass = event.url.split('/')[1];
        if (event.url === '/') { this.bodyClass = 'home'; }

        this.isLessMargin = event.url.includes('home') || event.url === '/' || event.url.includes('dashboard');
      }
    });
  }
}
