import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentTitleService } from '../_services';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  standalone: true
})
export class PageNotFoundComponent implements OnInit {
  public badurl: string;
  public returnUrl = signal<string>('/home');

  constructor(
    private readonly router: Router,
    private readonly documentTitleService: DocumentTitleService
  ) {
    this.badurl = this.router.url;
    const previousUrl = this.router
      .getCurrentNavigation()
      ?.previousNavigation?.finalUrl?.toString();
    if (previousUrl) {
      this.returnUrl.set(previousUrl);
    }
  }

  /** ngOnInit
  /* set the document title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Page Not Found');
  }

  public back(): void {
    this.router.navigateByUrl(this.returnUrl());
  }
}
