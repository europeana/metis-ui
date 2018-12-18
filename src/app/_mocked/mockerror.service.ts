import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MockErrorService {
  handleError(err: HttpErrorResponse): HttpErrorResponse | false {
    return err;
  }

  handleRetry<T>(): (o: Observable<T>) => Observable<T> {
    return (o) => o;
  }
}
