import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MoreResults, Results } from '../_models';

/** paginatedResult
/* generic pagination utility
*/
export function paginatedResult<T>(
  observables: Observable<Results<T>>[]
): Observable<MoreResults<T>> {
  return forkJoin(observables).pipe(
    map((resultList) => {
      const results = ([] as T[]).concat(...resultList.map((r) => r.results));
      const lastResult = resultList[resultList.length - 1];
      const more = lastResult.nextPage >= 0;
      const maxResultCountReached = lastResult.maxResultCountReached;
      return { results, more, maxResultCountReached };
    })
  );
}

/** collectResultsUptoPage
/* concatenate page results
*/
export function collectResultsUptoPage<T>(
  getResults: (page: number) => Observable<Results<T>>,
  endPage: number
): Observable<MoreResults<T>> {
  const observables: Observable<Results<T>>[] = [];
  for (let i = 0; i <= endPage; i++) {
    observables.push(getResults(i));
  }
  return paginatedResult(observables);
}
