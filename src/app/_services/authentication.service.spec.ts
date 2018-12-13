import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { currentUser, MockErrorService } from '../_mocked';
import { ErrorService, RedirectPreviousUrl } from '../_services';

import { AuthenticationService } from '.';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClient: HttpClient;
  let router: Router;
  let errors;
  let redirect: RedirectPreviousUrl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [
        RedirectPreviousUrl,
        HttpTestingController,
        { provide: ErrorService, useClass: MockErrorService },
      ],
    }).compileComponents();

    router = TestBed.get(Router);
    redirect = TestBed.get(RedirectPreviousUrl);
    httpClient = TestBed.get(HttpClient);
    errors = TestBed.get(ErrorService);

    service = new AuthenticationService(httpClient, router, errors, redirect);
  }));

  it('should return whether a user is validated', () => {
    expect(service.validatedUser()).toBe(false);

    localStorage.setItem('currentUser', '{}');
    expect(service.validatedUser()).toBe(true);
  });

  it('should try to get a token', () => {
    expect(service.getToken()).toBe(null);

    localStorage.setItem('currentUser', '{"token":"svfvdf"}');
    expect(service.getToken()).toBe('svfvdf');
  });

  it('should get the current user', () => {
    service.currentUser = currentUser;
    expect(service.getCurrentUser()).not.toBe(null);
  });

  afterEach(() => {
    localStorage.removeItem('currentUser');
  });
});
