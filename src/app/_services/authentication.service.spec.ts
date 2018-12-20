import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { apiSettings } from '../../environments/apisettings';
import { MockErrorService, mockUser } from '../_mocked';
import { ErrorService, RedirectPreviousUrl } from '../_services';

import { AuthenticationService } from '.';

describe('AuthenticationService', () => {
  let mockHttp: HttpTestingController;
  let router: Router;
  let redirect: RedirectPreviousUrl;
  let service: AuthenticationService;

  // tslint:disable-next-line: no-any
  function expectHttp<Data>(method: string, url: string, body: any, data: Data): void {
    const req = mockHttp.expectOne(apiSettings.apiHostAuth + url);
    expect(req.request.method).toBe(method);
    expect(req.request.body).toEqual(body);
    req.flush(data);
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        AuthenticationService,
        RedirectPreviousUrl,
        { provide: ErrorService, useClass: MockErrorService },
      ],
    }).compileComponents();

    mockHttp = TestBed.get(HttpTestingController);
    router = TestBed.get(Router);
    redirect = TestBed.get(RedirectPreviousUrl);
    service = TestBed.get(AuthenticationService);
  }));

  afterEach(() => {
    mockHttp.verify();
    localStorage.removeItem('currentUser');
    redirect.set(undefined);
  });

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
    service.currentUser = mockUser;
    expect(service.getCurrentUser()).toBe(mockUser);
  });

  it('should update the password', () => {
    service.updatePassword('123', '456').subscribe((result) => {
      expect(result).toBe(true);
    });
    expectHttp('PUT', '/authentication/update/password?newPassword=123&oldPassword=456', {}, {});
  });

  it('should register a new user', () => {
    service.register('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(true);
    });
    const req = mockHttp.expectOne(apiSettings.apiHostAuth + '/authentication/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Basic amFuQGV4YW1wbGUuY29tOnNhZmU=');
    req.flush({});
  });

  it('should redirect on login if already logged in', () => {
    service.currentUser = mockUser;

    spyOn(router, 'navigate');
    service.login('jan@example.com', 'fjgdf').subscribe((result) => {
      expect(result).toBe(true);
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

    spyOn(router, 'navigateByUrl');
    redirect.set('dash');
    service.login('jan@example.com', 'fjgdf').subscribe((result) => {
      expect(result).toBe(true);
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dash');
  });

  it('should login and save the user', () => {
    service.login('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });
    const req = mockHttp.expectOne(apiSettings.apiHostAuth + '/authentication/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Basic amFuQGV4YW1wbGUuY29tOnNhZmU=');
    req.flush(mockUser);

    service.currentUser = null;
    service.login('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(false);
      expect(service.getCurrentUser()).toEqual(null);
    });
    expectHttp('POST', '/authentication/login', {}, {});
  });

  it('should logout', () => {
    service.setCurrentUser(mockUser);
    expect(service.getCurrentUser()).toBe(mockUser);
    expect(service.getToken()).toBe('ffsafre');
    expect(localStorage.getItem('currentUser')).toBeTruthy();

    service.logout();

    expect(service.getCurrentUser()).toBeFalsy();
    expect(service.getToken()).toBeFalsy();
    expect(localStorage.getItem('currentUser')).toBeFalsy();
  });

  it('should reload the user', () => {
    service.reloadCurrentUser('jan@example.com').subscribe((result) => {
      expect(result).toBe(true);
      expect(service.getCurrentUser()).toBe(mockUser);
    });
    expectHttp('PUT', '/authentication/update/?userEmailToUpdate=jan@example.com', {}, mockUser);
  });
});
