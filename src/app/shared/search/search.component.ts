/** SearchComponent
/*  an input and submit button available to logged-in users used to search datasets
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services';
import { SubscriptionManager } from '../../shared/subscription-manager';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent extends SubscriptionManager implements OnInit {
  searchString: string;

  @Input() apiEndpoint?: string;
  @Input() placeholderKey: string;
  @Output() onExecute: EventEmitter<string> = new EventEmitter();

  /** constructor
  /*  - set the authentication service
  /*  - set the router
  */
  constructor(
    readonly authentication: AuthenticationService,
    private readonly router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  /** ngOnInit
  /* - set the searchString variable
  /* - ignore if 'undefined'
  /* - set searchString variable to URI-decoded query parameter
  */
  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params) => {
        const q = params.searchString;
        if (q !== undefined) {
          this.searchString = decodeURIComponent(q.trim());
        }
      })
    );
  }

  /** submitOnEnter
  /*  key down handler to call executeSearch
  /* @param {KeyboardEvent} e - the key event
  */
  submitOnEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.executeSearch();
    }
  }

  /** executeSearch
  /*  if the user is logged in
  /*  then redirect to the search results page
  /*  setting the query parameter to the URI-encoded q variable
  */
  executeSearch(): void {
    if (this.apiEndpoint) {
      if (this.authentication.validatedUser()) {
        this.router.navigate([this.apiEndpoint], {
          queryParams: { searchString: encodeURIComponent(this.searchString.trim()) }
        });
      } else {
        this.router.navigate(['/signin']);
      }
    } else {
      const searchTerm = this.searchString.trim();
      this.onExecute.emit(searchTerm);
    }
  }
}
