import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { currentUser } from '../_mocked';
import { ErrorService, RedirectPreviousUrl } from '../_services';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpClient: HttpClient;
  let router: Router;
  let errors;
  let redirect: RedirectPreviousUrl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [RedirectPreviousUrl, HttpTestingController, ErrorService],
    }).compileComponents();

    router = TestBed.get(Router);
    redirect = TestBed.get(RedirectPreviousUrl);
    httpClient = TestBed.get(HttpClient);
    errors = TestBed.get(ErrorService);

    service = new AuthenticationService(httpClient, router, errors, redirect);
  }));

  it('should return whether a user is validated', () => {
    if (service) {
      expect(service.validatedUser()).toBe(false);
    }
  });

  it('should try to get a token', () => {
    if (service) {
      expect(service.getToken()).toBe(null);
    }
  });

  it('should get the current user', () => {
    if (service) {
      service.currentUser = currentUser;
      expect(service.getCurrentUser()).not.toBe(null);
    }
  });
});
