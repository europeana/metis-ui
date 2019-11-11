/** MockActivatedRoute
/* - extend ActivatedRoute with customisable paramters
*/

import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

export class MockActivatedRoute extends ActivatedRoute {
  public queryParams = of({});

  /** setParams
  /* set the queryParams variable to an observable of the supplied hash
  /* @param {hash} paramsHash - a hash containing a 'q' key
  */
  setParams(paramsHash: { q?: string }): void {
    this.queryParams = of(paramsHash);
  }
}
