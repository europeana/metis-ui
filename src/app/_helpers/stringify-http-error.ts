import { HttpErrorResponse } from '@angular/common/http';

export function StringifyHttpError(err: HttpErrorResponse): string {
  let errmsg;
  if (err.error instanceof Error) {
    // A client-side or network error occurred. Handle it accordingly.
    if (err.status === 404) {
      errmsg = `${err.status} ${err.statusText}`;
    } else {
      errmsg = err.error.message;
    }
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    try {
      const h = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      errmsg = h['errorMessage'];
    } catch (e) {
      errmsg = null;
    }
    errmsg = `${err.status} ${errmsg || err.statusText}`;
  }
  return errmsg;
}
