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
  searchString: string;

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
  /* - set the searchString variable
  /* - ignore if 'undefined'
  /* - set searchString variable to URI-decoded query parameter
  */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = params.searchString;
      if (q !== undefined) {
        this.searchString = decodeURIComponent(q.trim());
      }
    });
  }

  /** submitOnEnter
  /*  redirect to the search results page with the search term as a query paramter on key down
  /* @param {KeyboardEvent} e - the key event
  */
  submitOnEnter(e: KeyboardEvent): void {
    if (e.which === 13) {
      this.executeSearch();
    }
  }

  /** executeSearch
  /*  if the user is logged in
  /*  then redirect to the search results page
  /*  setting the query parameter to the URI-encoded q variable
  */
  executeSearch(): void {
    if (this.authentication.validatedUser()) {
      this.router.navigate([`/search`], {
        queryParams: { searchString: encodeURIComponent(this.searchString.trim()) }
      });
    } else {
      this.router.navigate(['/signin']);
    }
  }
}
