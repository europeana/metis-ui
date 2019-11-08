import { Component, OnInit } from '@angular/core';
import { DocumentTitleService } from '../_services';

@Component({
  selector: 'search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  constructor(private readonly documentTitleService: DocumentTitleService) {}

  /** ngOnInit
  /* - set the document title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Search Results');
  }
}
