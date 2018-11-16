import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';

import { Observable } from 'rxjs';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {

  private auth: AuthenticationService;
  constructor(private inj: Injector) {}

  /** intercept
  /* this hooks into all outgoing HTTP requests, and if the user is logged in,
  /* an authorization header is inserted: { Authorization: 'Bearer [token]' }
  /*
  /* the token is that which was passed back during successful login and was saved
  /* insert authorization header into all outgoing calls
  /*
  /* @param {httprequest} request - identify the http request, url
  /* @param {httphandler} next
  */
  //tslint:disable-next-line: no-any
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.match(/signin|register/)) {
      const auth = this.inj.get(AuthenticationService);
      const token = auth.getToken();

      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        request = request.clone({
          setHeaders: headers
        });
      }
    }
    return next.handle(request);
  }
}
