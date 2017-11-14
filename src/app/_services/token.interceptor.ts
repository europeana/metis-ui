import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs/Observable';

// TokenInterceptor:
//
// This hooks into all outgoing HTTP requests, and if the user is logged in,
// an authorization header is inserted: { Authorization: 'Bearer [token]' }
//
// The token is that which was passed back during successful login and was saved.
//
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth;
  constructor(private inj: Injector) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.inj.get(AuthenticationService);
    const token = auth.getToken();
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      console.log(`Token interceptor => ${JSON.stringify(headers)}`);
        // Insert authorization header into all outgoing calls
        request = request.clone({
          setHeaders: headers
        });
    }

    return next.handle(request);
  }
}
