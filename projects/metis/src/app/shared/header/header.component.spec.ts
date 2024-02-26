import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockActivatedRoute, MockAuthenticationService } from '../../_mocked';
import { AuthenticationService, RedirectPreviousUrl } from '../../_services';

import { HomeComponent } from '../../home';
import { LoginComponent } from '../../login';
import { ProfileComponent } from '../../profile';
import { RegisterComponent } from '../../register';
import { SearchComponent } from '../../shared/search';

import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let header: HeaderComponent;
  let router: Router;
  let auth: AuthenticationService;
  let redirect: RedirectPreviousUrl;

  const configureTestbed = (searchStringParam?: string): void => {
    const mar = new MockActivatedRoute();
    if (searchStringParam) {
      mar.setQueryParams({ searchString: searchStringParam });
    }
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'profile', component: ProfileComponent },
          { path: 'signin', component: LoginComponent },
          { path: 'home', component: HomeComponent },
          { path: 'register', component: RegisterComponent },
          { path: 'search', component: SearchComponent }
        ])
      ],
      declarations: [HeaderComponent, createMockPipe('translate')],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ActivatedRoute, useValue: mar }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(HeaderComponent);
    header = fixture.debugElement.componentInstance;
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthenticationService);
    redirect = TestBed.inject(RedirectPreviousUrl);
    fixture.detectChanges();
  };

  describe('Without Parameter', () => {
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(b4Each);

    it('should initialise searchString according to the route', () => {
      expect(header.searchString).toBeFalsy();
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

    it('should get if the user icon is active', fakeAsync(() => {
      expect(header.userIconActive()).toBeFalsy();
      header.gotoProfile();
      tick(1);
      expect(header.userIconActive()).toBeTruthy();
    }));

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

    it('should execute a search', () => {
      spyOn(router, 'navigate');
      header.executeSearch('123');
      expect(router.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: {
          searchString: '123'
        }
      });
    });

    it('should redirect unauthenticated users', () => {
      spyOn(router, 'navigate');
      spyOn(auth, 'validatedUser').and.callFake(() => {
        return false;
      });
      header.executeSearch('123');
      expect(router.navigate).toHaveBeenCalledWith(['/signin']);
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

  describe('With Parameter', () => {
    beforeEach(async(() => {
      configureTestbed('abc');
    }));

    beforeEach(b4Each);

    it('should initialise searchString according to the route', () => {
      expect(header.searchString).toEqual('abc');
    });
  });
});
