import { HttpHandlerFn, HttpRequest, provideHttpClient } from '@angular/common/http';
import { runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockAuthenticationService } from '../_mocked';
import { AuthenticationService, tokenInterceptor } from '.';

describe('TokenInterceptor', () => {
  let auth: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        provideHttpClient()
      ]
    });
    auth = TestBed.inject(AuthenticationService);
  });

  // Load the interceptor function in a context where dependencies can be injected
  const runInterceptorWithDI = (url: string): string | null => {
    let res: string | null = '';

    runInInjectionContext(
      {
        get: () => {
          return auth;
        }
      },
      () => {
        // eslint-disable-next-line rxjs/no-ignored-observable
        tokenInterceptor()(new HttpRequest('GET', url), (((req: HttpRequest<unknown>) => {
          res = req.headers.get('Authorization');
          return of(req);
        }) as unknown) as HttpHandlerFn);
      }
    );
    return res;
  };

  it('should insert an authorization header if logged in', () => {
    expect(runInterceptorWithDI('/')).toEqual('Bearer ffsafre');
  });

  it('should not insert an authorization header if not logged in', () => {
    spyOn(auth, 'getToken').and.returnValue(null);
    expect(runInterceptorWithDI('/')).toEqual(null);
  });

  it('should not insert an authorization header for signin', () => {
    expect(runInterceptorWithDI('/signin')).toEqual(null);
  });

  it('should not insert an authorization header for register', () => {
    expect(runInterceptorWithDI('/register')).toEqual(null);
  });

  it('should insert an authorization header for other urls', () => {
    expect(runInterceptorWithDI('/europeana-random-whatever')).toEqual('Bearer ffsafre');
  });
});
