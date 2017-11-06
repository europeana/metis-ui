import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth;
  constructor(private inj: Injector) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.inj.get(AuthenticationService);
    const token = auth.getToken();
    console.log(request);
    if (token) {
        // Insert authorization header into all outgoing calls
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
    }

    return next.handle(request);
  }
}
