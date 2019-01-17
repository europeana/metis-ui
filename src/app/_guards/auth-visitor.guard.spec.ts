import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MockAuthenticationService } from '../_mocked';
import { AuthenticationService } from '../_services';

import { AuthVisitorGuard } from '.';

describe('AuthVisitorGuard', () => {
  let guard: AuthVisitorGuard;
  let authenticationService: AuthenticationService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useClass: MockAuthenticationService }],
      imports: [RouterTestingModule],
    }).compileComponents();
    guard = TestBed.get(AuthVisitorGuard);
    authenticationService = TestBed.get(AuthenticationService);
    router = TestBed.get(Router);
  }));

  it('should allow an non-authenticated user', () => {
    spyOn(authenticationService, 'validatedUser').and.returnValue(undefined);
    expect(guard.canActivate()).toBe(true);
  });

  it('should not allow an authenticated user', () => {
    spyOn(router, 'navigate');

    expect(guard.canActivate()).toBe(false);

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
