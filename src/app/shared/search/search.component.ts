/** SearchComponent
/*  an input and submit button available to logged-in users used to search datasets
*/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  q: string;

  /** constructor
  /*  - set the authentication service
  /*  - set the router
  */
  constructor(
    readonly authentication: AuthenticationService,
    private readonly router: Router,
    private route: ActivatedRoute
  ) {}

  /** ngOnInit
  /* - set the q variable
  */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = params.q;
      // prevent 'undefined' appearing as a search parameter
      if (q !== undefined) {
        this.q = decodeURIComponent(q);
      }
    });
  }

  /** executeSearch
  /*  redirect to the search results page with the search term as a query paramter on click
  */
  executeSearch(): void {
    if (this.authentication.validatedUser()) {
      this.router.navigate([`/search`], { queryParams: { q: encodeURIComponent(this.q) } });
    }
  }

  /** submitOnEnter
  /*  redirect to the search results page with the search term as a query paramter on key down
  */
  submitOnEnter(e: KeyboardEvent): void {
    if (e.which === 13) {
      this.executeSearch();
    }
  }
}
