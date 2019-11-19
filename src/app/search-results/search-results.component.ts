/** SearchResultsComponent
/* - component for viewing search results
/* - subscribes to ActivatedRoute instance for live query / result data
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetSearchResult } from '../_models';
import { AuthenticationService, DatasetsService, DocumentTitleService } from '../_services';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  searchString: string;
  currentPage = 0;
  isLoading = false;
  hasMore = false;
  query: string;
  results: DatasetSearchResult[];

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly documentTitleService: DocumentTitleService,
    private readonly datasets: DatasetsService,
    private readonly router: Router,
    private route: ActivatedRoute
  ) {}

  /** ngOnInit
  /* - URI-decode the query parameter
  /* - set the query variable
  /* - set the document title
  /*  - includes the query variable if available
  */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchString = params.searchString;
      this.load();
      this.documentTitleService.setTitle(
        ['Search Results', this.searchString]
          .filter((x) => {
            return x;
          })
          .join(' | ')
      );
    });
  }

  /** loadNextPage
  /* - increment the page tracking variable
  /* - call load function
  */
  loadNextPage(): void {
    this.currentPage++;
    this.load();
  }

  /** userValidated
  /* - checks if user is authenticated
  /* - redirects to signin page if not authenticated
  */
  userValidated(): boolean {
    if (this.authentication.validatedUser()) {
      return true;
    }
    this.router.navigate(['/signin']);
    return false;
  }

  /** load
  /* - do nothing if there is no searchString variable set
  /* - sets the query variable to the decoded searchString variable
  /* - manages isLoading and hasMore variables
  /* - invokes dataset search service
  /* - assigns result to results variable
  */
  load(): void {
    if (this.userValidated() && this.searchString) {
      this.query = decodeURIComponent(this.searchString);
      this.isLoading = true;

      this.datasets.getSearchResultsUptoPage(this.searchString, this.currentPage).subscribe(
        ({ results, more }) => {
          this.results = results;
          this.isLoading = false;
          this.hasMore = more;
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log(err);
        }
      );
    } else {
      this.results = [];
      this.searchString = '';
      this.query = '';
      this.hasMore = false;
    }
  }
}
