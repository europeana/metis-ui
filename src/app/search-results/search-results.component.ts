/** SearchResultsComponent
/* - component for viewing search results
/* - subscribes to ActivatedRoute instance for live query / result data
*/
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DocumentTitleService } from '../_services';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  query: string;

  constructor(
    private readonly documentTitleService: DocumentTitleService,
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
      this.documentTitleService.setTitle('Search Results');
      const q = params.q;
      if (q) {
        this.query = decodeURIComponent(q);
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
