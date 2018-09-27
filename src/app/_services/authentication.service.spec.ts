import { AuthenticationService } from './authentication.service';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

import { RedirectPreviousUrl } from '../_services';

import { currentUser } from '../_mocked';
import { apiSettings } from '../../environments/apisettings';

describe('AuthenticationService', () => {

  let service: AuthenticationService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let redirect: RedirectPreviousUrl;

   beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule ],
      providers: [ RedirectPreviousUrl, HttpTestingController]
    })
    .compileComponents();

    router = TestBed.get(Router);
    redirect = TestBed.get(RedirectPreviousUrl);
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    service = new AuthenticationService(httpClient, router, redirect); 

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
