import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DocumentTitleService } from '../_services';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  standalone: true
})
export class PageNotFoundComponent implements OnInit {
  public badurl: string;

  constructor(router: Router, private readonly documentTitleService: DocumentTitleService) {
    this.badurl = router.url;
  }

  /** ngOnInit
  /* set the document title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Page Not Found');
  }
}
