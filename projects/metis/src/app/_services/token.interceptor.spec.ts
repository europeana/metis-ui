import { HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockAuthenticationService } from '../_mocked';

import { AuthenticationService, TokenInterceptor } from '.';

describe('TokenInterceptor', () => {
  let service: TokenInterceptor;
  let auth: AuthenticationService;

  function checkAuthorizationForUrl(url: string, authorization: string | null): void {
    const handler = { handle: jasmine.createSpy('handle') };
    // eslint-disable-next-line rxjs/no-ignored-observable
    service.intercept(new HttpRequest('GET', url), handler);
    const request = handler.handle.calls.first().args[0];
    expect(handler.handle).toHaveBeenCalled();
    expect(request.headers.get('Authorization')).toBe(authorization);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TokenInterceptor,
        { provide: AuthenticationService, useClass: MockAuthenticationService }
      ],
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    service = TestBed.inject(TokenInterceptor);
    auth = TestBed.inject(AuthenticationService);
  });

  it('should insert an authorization header if logged in', () => {
    checkAuthorizationForUrl('/', 'Bearer ffsafre');
  });

  it('should not insert an authorization header if not logged in', () => {
    spyOn(auth, 'getToken').and.returnValue(null);
    checkAuthorizationForUrl('/', null);
  });

  it('should not insert an authorization header for signin', () => {
    checkAuthorizationForUrl('/signin', null);
  });

  it('should not insert an authorization header for register', () => {
    checkAuthorizationForUrl('/register', null);
  });
});
