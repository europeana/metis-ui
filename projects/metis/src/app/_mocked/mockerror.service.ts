import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MockErrorService {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  handleError(err: HttpErrorResponse): HttpErrorResponse | false {
    return err;
  }

  handleRetry<T>(): (o: Observable<T>) => Observable<T> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return (o) => o;
  }
}
