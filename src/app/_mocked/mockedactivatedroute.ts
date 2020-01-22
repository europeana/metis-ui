/** MockActivatedRoute
/* - extend ActivatedRoute with customisable paramters
*/

import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

export class MockActivatedRoute extends ActivatedRoute {
  public queryParams = of({});
  public params = of({});

  /** setQueryParams
  /* set the queryParams variable to an observable of the supplied hash
  /* @param {hash} paramsHash
  */
  setQueryParams(paramsHash: { searchString?: string }): void {
    this.queryParams = of(paramsHash);
  }
}
