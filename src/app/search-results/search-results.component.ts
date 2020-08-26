/** SearchResultsComponent
/* - component for viewing search results
/* - subscribes to ActivatedRoute instance for live query / result data
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetSearchView } from '../_models';
import { DatasetsService, DocumentTitleService } from '../_services';
import { SubscriptionManager } from '../shared/subscription-manager';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent extends SubscriptionManager implements OnInit {
  searchString: string;
  currentPage = 0;
  isLoading = false;
  hasMore = false;
  query: string;
  results: DatasetSearchView[];

  constructor(
    private readonly documentTitleService: DocumentTitleService,
    private readonly datasets: DatasetsService,
    private route: ActivatedRoute
  ) {
    super();
  }

  /** ngOnInit
  /* - URI-decode the query parameter
  /* - set the query variable
  /* - set the document title
  /*  - includes the query variable if available
  */
  ngOnInit(): void {
    this.subs.push(
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
      })
    );
  }

  /** loadNextPage
  /* - increment the page tracking variable
  /* - call load function
  */
  loadNextPage(): void {
    this.currentPage++;
    this.load();
  }

  /** load
  /* - do nothing if there is no searchString variable set
  /* - sets the query variable to the decoded searchString variable
  /* - manages isLoading and hasMore variables
  /* - invokes dataset search service
  /* - assigns result to results variable
  */
  load(): void {
    if (this.searchString) {
      this.query = decodeURIComponent(this.searchString);
      this.isLoading = true;

      const subResults = this.datasets
        .getSearchResultsUptoPage(this.searchString, this.currentPage)
        .subscribe(
          ({ results, more }) => {
            this.results = results;
            this.isLoading = false;
            this.hasMore = more;
            subResults.unsubscribe();
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            console.log(err);
            subResults.unsubscribe();
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
