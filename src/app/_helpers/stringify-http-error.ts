import { HttpErrorResponse } from '@angular/common/http';

export function StringifyHttpError(err: HttpErrorResponse): string {
  let errmsg;
  if (err.error instanceof Error) {
    // A client-side or network error occurred. Handle it accordingly.
    errmsg = `Unexpected error: ${err.error.message}, please try again later`;
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    try {
      errmsg = JSON.parse(err.error);
      errmsg = errmsg['errorMessage'] || errmsg;
    } catch (e) {
      errmsg = err.error;
    }
    if (err.status && errmsg) {
      errmsg = `${err.status} ${errmsg}`;
    } else {
      errmsg = 'Unexpected network error, please try again later';
    }
  }
  return errmsg;
}
