import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {
  public badurl: string;

  constructor(router: Router) {
    this.badurl = router.url;
  }
}
