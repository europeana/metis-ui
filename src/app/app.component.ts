import { Component, OnInit } from '@angular/core';
import { Router, UrlTree }   from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(public router: Router) {}

  routerEventSubscription;
  isHome: boolean = false;
  
  ngOnInit(): void {

    this.routerEventSubscription = this.router.events.subscribe((event: any) => {
      if (this.router.isActive(event.url, false)) { 
        if (event.url.includes('home') || event.url === '/') {
          this.isHome = true;
        }
      }
    });

  }

}
