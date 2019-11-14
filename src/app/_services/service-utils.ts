import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MoreResults, Results } from '../_models';

export function paginatedResult<T>(
  observables: Observable<Results<T>>[]
): Observable<MoreResults<T>> {
  return forkJoin(observables).pipe(
    map((resultList) => {
      const results = ([] as T[]).concat(...resultList.map((r) => r.results));
      const lastResult = resultList[resultList.length - 1];
      const more = lastResult.nextPage >= 0;
      return { results, more };
    })
  );
}

/** collectResultsUptoPage
/* generic pagination utility
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

/*
 collectResultsUptoPage<T>(
    getResults: (page: number) => Observable<Results<T>>,
    endPage: number
  ): Observable<MoreResults<T>> {
    const observables: Observable<Results<T>>[] = [];
    for (let i = 0; i <= endPage; i++) {
      observables.push(getResults(i));
    }
    return this.paginatedResult(observables);
  }
*/
