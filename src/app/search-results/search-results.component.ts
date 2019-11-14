/** SearchResultsComponent
/* - component for viewing search results
/* - subscribes to ActivatedRoute instance for live query / result data
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetSearchResult } from '../_models';
import { DatasetsService, DocumentTitleService } from '../_services';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  currentPage: 0;
  isLoading = false;
  hasMore = false;
  query: string;
  results: DatasetSearchResult[];

  constructor(
    private readonly documentTitleService: DocumentTitleService,
    private readonly datasets: DatasetsService,
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
      const q = params.q;

      if (q) {
        this.query = decodeURIComponent(q);
        this.isLoading = true;
        this.datasets.getSearchResultsUptoPage(q, 0).subscribe(
          ({ results, more }) => {
            this.results = results;
            this.isLoading = false;
            this.hasMore = more;
          },
          (err: HttpErrorResponse) => {
            console.log(err);
            this.isLoading = false;
          }
        );
      }
      this.documentTitleService.setTitle(
        ['Search Results', q]
          .filter((x) => {
            return x;
          })
          .join(' | ')
      );
    });
  }
}
