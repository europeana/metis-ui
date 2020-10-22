import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { apiSettings } from '../../environments/apisettings';
import { DashboardComponent } from '../dashboard';
import { MockHttp } from '../_helpers/test-helpers';
import { MockErrorService, mockUser } from '../_mocked';
import { ErrorService, RedirectPreviousUrl } from '../_services';

import { AuthenticationService } from '.';

describe('AuthenticationService', () => {
  let mockHttp: MockHttp;
  let router: Router;
  let redirect: RedirectPreviousUrl;
  let service: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: './dashboard', component: DashboardComponent }]),
        HttpClientTestingModule
      ],
      providers: [
        AuthenticationService,
        RedirectPreviousUrl,
        { provide: ErrorService, useClass: MockErrorService }
      ]
    }).compileComponents();

    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostAuth);
    router = TestBed.inject(Router);
    redirect = TestBed.inject(RedirectPreviousUrl);
    service = TestBed.inject(AuthenticationService);
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
    const sub = service.updatePassword('123', '456').subscribe((result) => {
      expect(result).toBe(true);
    });
    mockHttp
      .expect('PUT', '/authentication/update/password')
      .body({ newPassword: '123', oldPassword: '456' })
      .send({});
    sub.unsubscribe();
  });

  it('should register a new user', () => {
    const sub = service.register('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(true);
    });
    mockHttp
      .expect('POST', '/authentication/register')
      .basicAuth('amFuQGV4YW1wbGUuY29tOnNhZmU=')
      .send({});
    sub.unsubscribe();
  });

  it('should redirect on login if already logged in', fakeAsync(() => {
    service.currentUser = mockUser;

    spyOn(router, 'navigate');
    const subLogin1 = service.login('jan@example.com', 'fjgdf').subscribe((result) => {
      expect(result).toBe(true);
    });
    tick(1);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    subLogin1.unsubscribe();

    spyOn(router, 'navigateByUrl');
    redirect.set('dash');
    const subLogin2 = service.login('jan@example.com', 'fjgdf').subscribe((result) => {
      expect(result).toBe(true);
    });
    tick(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dash');
    subLogin2.unsubscribe();
  }));

  it('should login and save the user', fakeAsync(() => {
    const subLogin1 = service.login('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });
    mockHttp
      .expect('POST', '/authentication/login')
      .basicAuth('amFuQGV4YW1wbGUuY29tOnNhZmU=')
      .send(mockUser);
    tick(1);
    subLogin1.unsubscribe();

    service.currentUser = null;

    const subLogin2 = service.login('jan@example.com', 'safe').subscribe((result) => {
      expect(result).toBe(false);
      expect(service.getCurrentUser()).toEqual(null);
    });
    mockHttp.expect('POST', '/authentication/login').send({});
    tick(1);
    subLogin2.unsubscribe();
  }));

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

  it('should reload the user', fakeAsync(() => {
    const subReload1 = service.reloadCurrentUser('jan@example.com').subscribe((result) => {
      expect(result).toBe(true);
      expect(service.getCurrentUser()).toBe(mockUser);
    });
    mockHttp
      .expect('PUT', '/authentication/update')
      .body({ email: 'jan@example.com' })
      .send(mockUser);

    tick(1);
    subReload1.unsubscribe();

    service.currentUser = null;
    const subReload2 = service.reloadCurrentUser('jan@example.com').subscribe((result) => {
      expect(result).toBe(false);
      expect(service.getCurrentUser()).toBe(null);
    });
    mockHttp
      .expect('PUT', '/authentication/update')
      .body({ email: 'jan@example.com' })
      .send(null);

    tick(1);
    subReload2.unsubscribe();
  }));
});

it('should use the user from localstorage', () => {
  localStorage.setItem(
    'currentUser',
    JSON.stringify({ user: mockUser, email: 'jan@example.com', token: 'tggij534$' })
  );
  TestBed.configureTestingModule({
    imports: [RouterTestingModule, HttpClientTestingModule],
    providers: [
      AuthenticationService,
      RedirectPreviousUrl,
      { provide: ErrorService, useClass: MockErrorService }
    ]
  }).compileComponents();

  const service: AuthenticationService = TestBed.inject(AuthenticationService);
  expect(service.currentUser).toEqual(mockUser);

  localStorage.removeItem('currentUser');
});
