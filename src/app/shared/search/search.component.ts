/** SearchComponent
/*  an input and submit button available to logged-in users used to search datasets
*/
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  q: string;

  /** constructor
  /*  - set the authentication service
  /*  - set the router
  */
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly router: Router
  ) {}

  /** executeSearch
  /*  redirect to the search results page with the search term as a query paramter on click
  */
  executeSearch(): void {
    if (this.authentication.validatedUser()) {
      this.router.navigate([`/search`], { queryParams: { q: this.q } });
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
