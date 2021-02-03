import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../login';
import { MockAuthenticationService } from '../_mocked';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';

import { AuthUserGuard } from '.';

describe('AuthUserGuard', () => {
  let guard: AuthUserGuard;
  let authenticationService: AuthenticationService;
  let redirect: RedirectPreviousUrl;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useClass: MockAuthenticationService }],
      imports: [RouterTestingModule.withRoutes([{ path: './signin', component: LoginComponent }])]
    }).compileComponents();
    guard = TestBed.inject(AuthUserGuard);
    authenticationService = TestBed.inject(AuthenticationService);
    redirect = TestBed.inject(RedirectPreviousUrl);
    router = TestBed.inject(Router);
  }));

  it('should allow an authenticated user', () => {
    expect(guard.canActivate()).toBe(true);
  });

  it('should not allow an non-authenticated user', () => {
    spyOn(authenticationService, 'validatedUser').and.returnValue(false);
    spyOn(redirect, 'set');
    spyOn(router, 'navigate');

    expect(guard.canActivate()).toBe(false);

    expect(redirect.set).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/signin']);
  });
});
