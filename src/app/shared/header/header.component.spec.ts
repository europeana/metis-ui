import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockAuthenticationService } from '../../_mocked';
import { AuthenticationService, RedirectPreviousUrl } from '../../_services';

import { HomeComponent } from '../../home';
import { LoginComponent } from '../../login';
import { ProfileComponent } from '../../profile';
import { RegisterComponent } from '../../register';

import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let header: HeaderComponent;
  let router: Router;
  let auth: AuthenticationService;
  let redirect: RedirectPreviousUrl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './profile', component: ProfileComponent },
          { path: './signin', component: LoginComponent },
          { path: './register', component: RegisterComponent },
          { path: './home', component: HomeComponent }
        ])
      ],
      declarations: [HeaderComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    header = fixture.debugElement.componentInstance;
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthenticationService);
    redirect = TestBed.inject(RedirectPreviousUrl);
  });

  it('should toggle the signin menu', () => {
    expect(header.openSignIn).toBe(false);
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(false);
  });

  it('should have the right logo link', () => {
    expect(header.logoLink()).toBe('/home');

    header.loggedIn = true;
    expect(header.logoLink()).toBe('/dashboard');
  });

  it('should go to the profile page', () => {
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    spyOn(router, 'navigate');

    header.gotoProfile();

    expect(header.openSignIn).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should go to the login page', () => {
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    spyOn(router, 'navigate');

    header.gotoLogin();

    expect(header.openSignIn).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/signin']);
  });

  it('should go to the register page', () => {
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    spyOn(router, 'navigate');

    header.gotoRegister();

    expect(header.openSignIn).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should get the login status', () => {
    header.loggedIn = false;
    expect(header.isLoggedIn()).toBe(false);
    header.loggedIn = true;
    expect(header.isLoggedIn()).toBe(true);
  });

  it('should logout', () => {
    spyOn(auth, 'logout');
    redirect.set('test56');
    header.loggedIn = true;
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    spyOn(router, 'navigate');

    header.logOut();

    expect(auth.logout).toHaveBeenCalledWith();
    expect(redirect.get()).toBe(undefined);
    expect(header.isLoggedIn()).toBe(false);
    expect(header.openSignIn).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should close the signin if clicked outside', () => {
    header.toggleSignInMenu();
    expect(header.openSignIn).toBe(true);
    header.onClickedOutsideUser(new Event('click'));
    expect(header.openSignIn).toBe(false);
  });
});
