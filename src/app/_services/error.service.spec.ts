import { HttpErrorResponse } from '@angular/common/http';
import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MockTranslateService } from '../_mocked';
import { TranslateService } from '../_translate';
import { ErrorService, RedirectPreviousUrl } from '.';

describe('ErrorService', () => {
  let service: ErrorService;
  let router: Router;
  let redirect: RedirectPreviousUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        ErrorService,
        RedirectPreviousUrl,

        { provide: TranslateService, useClass: MockTranslateService }
      ]
    });
    service = TestBed.inject(ErrorService);
    router = TestBed.inject(Router);
    redirect = TestBed.inject(RedirectPreviousUrl);

    service.retryDelay = 5;
  });

  afterEach(() => {
    localStorage.removeItem('currentUser');
  });

  it('should handle a 401', async(() => {
    redirect.set('test1');
    localStorage.setItem('currentUser', 'user1');
    spyOn(router, 'navigate');
    redirect.set('test2');
    localStorage.setItem('currentUser', 'user2');
    expect(service.handleError(new HttpErrorResponse({ status: 401 }))).toBe(false);
    expect(router.navigate).toHaveBeenCalled();
  }));

  it('should ignore other errors', async(() => {
    redirect.set('test2');
    localStorage.setItem('currentUser', 'user3');
    spyOn(router, 'navigate');

    const err1 = new HttpErrorResponse({
      status: 404,
      statusText: 'not found',
      error: new Error('not found')
    });
    expect(service.handleError(err1)).toBe(err1);
    const err2 = new HttpErrorResponse({
      status: 500,
      statusText: 'server err',
      error: new Error('server err')
    });
    expect(service.handleError(err2)).toBe(err2);

    expect(redirect.get()).toBe('test2');
    expect(localStorage.getItem('currentUser')).toBe('user3');
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should retry', async(() => {
    // generate an observable that, when started, will take 1 value or error from the array and yield it
    // so on each (re)start, the observable will yield the next item from the array
    // the items of the array can be strings or numbers
    // a string will map to itself as a value
    // a number will map to an error with the number as status field
    function fromValues(array: (string | number)[]): Observable<string> {
      return new Observable<string>((subscriber) => {
        const value = array.shift();
        if (typeof value === 'string') {
          subscriber.next(value);
          subscriber.complete();
        } else {
          subscriber.error({ status: value });
        }
      });
    }

    const rawResponses = [['ans1'], [3, 'ans2'], [0, 0, 'ans3'], [0, 0, 0, 0, 0, 0, 0, 'ans4']];
    const expectedResponses = ['ans1', 'error:3', 'ans3', 'error:0'];

    const sub = forkJoin(
      rawResponses.map((x) =>
        fromValues(x).pipe(
          service.handleRetry<string>(),
          catchError((err) => of(`error:${err.status}`))
        )
      )
    ).subscribe((actualResponses) => {
      expect(actualResponses).toEqual(expectedResponses);
      sub.unsubscribe();
    });
  }));
});
