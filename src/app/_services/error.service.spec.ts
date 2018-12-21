import { HttpErrorResponse } from '@angular/common/http';
import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorService, RedirectPreviousUrl } from '.';

describe('ErrorService', () => {
  let service: ErrorService;
  let router: Router;
  let redirect: RedirectPreviousUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [ErrorService, RedirectPreviousUrl],
    });
    service = TestBed.get(ErrorService);
    router = TestBed.get(Router);
    redirect = TestBed.get(RedirectPreviousUrl);
  });

  afterEach(() => {
    localStorage.removeItem('currentUser');
  });

  it('should handle a 401', async(() => {
    redirect.set('test2');
    localStorage.setItem('currentUser', 'user3');
    spyOn(router, 'navigate');

    expect(service.handleError(new HttpErrorResponse({ status: 401 }))).toBe(false);

    expect(redirect.get()).toBe('/');
    expect(localStorage.getItem('currentUser')).toBe(null);
    expect(router.navigate).toHaveBeenCalledWith(['/signin']);
  }));

  it('should handle a wrong access token', async(() => {
    redirect.set('test2');
    localStorage.setItem('currentUser', 'user3');
    spyOn(router, 'navigate');

    expect(
      service.handleError(new HttpErrorResponse({ error: { errorMessage: 'Wrong access token' } })),
    ).toBe(false);

    expect(redirect.get()).toBe('/');
    expect(localStorage.getItem('currentUser')).toBe(null);
    expect(router.navigate).toHaveBeenCalledWith(['/signin']);
  }));

  it('should ignore other errors', async(() => {
    redirect.set('test2');
    localStorage.setItem('currentUser', 'user3');
    spyOn(router, 'navigate');

    const err1 = new HttpErrorResponse({
      status: 404,
      statusText: 'not found',
      error: new Error('not found'),
    });
    expect(service.handleError(err1)).toBe(err1);
    const err2 = new HttpErrorResponse({
      status: 500,
      statusText: 'server err',
      error: new Error('server err'),
    });
    expect(service.handleError(err2)).toBe(err2);

    expect(redirect.get()).toBe('test2');
    expect(localStorage.getItem('currentUser')).toBe('user3');
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
