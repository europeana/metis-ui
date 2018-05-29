import { AuthenticationService } from './authentication.service';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { currentUser } from '../_mocked';
import { apiSettings } from '../../environments/apisettings';

describe('AuthenticationService', () => {

  let service: AuthenticationService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => { 
  	
  	TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });

  	httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    service = new AuthenticationService(httpClient); 

  });

  it('should return whether a user is validated', () => {
    expect(service.validatedUser()).toBe(false);
  });

  it('should try to get a token', () => {
    expect(service.getToken()).toBe(null);
  });

  it('should get the current user', () => {
  	service.currentUser = currentUser;
  	expect(service.getCurrentUser()).not.toBe(null);  	
  });
 
});
