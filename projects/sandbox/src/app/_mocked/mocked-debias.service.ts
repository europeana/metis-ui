import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DebiasInfo, DebiasReport, DebiasState } from '../_models';

export class MockDebiasService {
  errorMode = false;

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      })
    );
  }

  getDebiasInfo(datasetId: string): Observable<DebiasInfo> {
    return of(({
      europeanaId: datasetId,
      state: (datasetId as unknown) as DebiasState,
      sourceField: 'DC_TITLE'
    } as unknown) as DebiasInfo);
  }

  getDebiasReport(datasetId: string): Observable<DebiasReport> {
    if (this.errorMode) {
      return this.getError('mock getDebiasReport throws error');
    }
    return of(({
      state: (datasetId as unknown) as DebiasState,
      detections: []
    } as unknown) as DebiasReport);
  }

  runDebiasReport(datasetId: string): Observable<boolean> {
    if (this.errorMode) {
      return this.getError('mock runDebiasReport throws error');
    }
    return of(parseInt(datasetId) % 2 === 0);
  }
}

export class MockDebiasServiceErrors extends MockDebiasService {
  errorMode = true;
}
