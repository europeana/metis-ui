import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';

/** tokenInterceptor
/* @return HttpInterceptorFn
*/
export function tokenInterceptor(): HttpInterceptorFn {
  /** HttpInterceptorFn
  /* this hooks into all outgoing HTTP requests, and if the user is logged in,
  /* an authorization header is inserted: { Authorization: 'Bearer [token]' }
  /*
  /* the token is that which was passed back during successful login and was saved
  /* insert authorization header into all outgoing calls
  /*
  /* @param { HttpRequest } request
  /* @param { HttpHandlerFn } next
  /* @return HttpInterceptorFn
  */
  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    if (!request.url.match(/signin|register|metis-maintenance/)) {
      const auth = inject(AuthenticationService);
      const token = auth.getToken();
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        request = request.clone({
          setHeaders: headers
        });
      }
    }
    return next(request);
  };
}
