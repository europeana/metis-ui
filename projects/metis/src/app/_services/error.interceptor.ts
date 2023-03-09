import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, retry, timer } from 'rxjs';
import { RedirectPreviousUrl } from './redirect-previous-url.service';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  numberOfRetries = 2;
  static retryDelay = 1000;

  constructor(
    private readonly router: Router,
    private readonly redirectPreviousUrl: RedirectPreviousUrl
  ) {}

  /** intercept
   * Adds a retry pipe to the http handler
   * @param { HttpRequest } request
   * @param { HttpHandler } handler
   * @returns Observable<HttpEvent>
   **/
  intercept(request: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    return handler
      .handle(request)
      .pipe(retry({ count: this.numberOfRetries, delay: this.shouldRetry }));
  }

  /** shouldRetry
   * Returns a predfined delay or throws the error passed
   * @param { HttpErrorResponse } error
   * @returns Observable<number>
   **/
  shouldRetry(error: HttpErrorResponse): Observable<number> {
    const status = parseInt(`${error.status}`);
    if (status === 401) {
      this.expiredToken();
    } else if (![200, 406].includes(status)) {
      return timer(ErrorInterceptor.retryDelay);
    }
    throw error;
  }

  /** expiredToken
   * if token expired: remember current url,
   * logout,
   * navigate to signin page
   **/
  expiredToken(): void {
    this.redirectPreviousUrl.set(this.router.url);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/signin']);
  }
}
