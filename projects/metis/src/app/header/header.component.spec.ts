import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Keycloak from 'keycloak-js';
import { createMockPipe, mockedKeycloak } from 'shared';
import { MockActivatedRoute } from '../_mocked';
import { TranslatePipe, TranslateService } from '../_translate';
import { MockTranslateService } from '../_mocked';
import { HomeComponent } from '../home';
import { SearchComponent } from '../shared/search';

import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let header: HeaderComponent;
  let router: Router;
  let keycloak: Keycloak;

  const keyCloakLoggedIn = ({
    idToken: 'x',
    authenticated: true,
    logout: () => {}
  } as unknown) as Keycloak;

  const configureTestbed = (searchStringParam?: string): void => {
    const mar = new MockActivatedRoute();
    if (searchStringParam) {
      mar.setQueryParams({ searchString: searchStringParam });
    }
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'home', component: HomeComponent },
          { path: 'search', component: SearchComponent }
        ]),
        HeaderComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: ActivatedRoute, useValue: mar },
        { provide: TranslatePipe, useValue: createMockPipe('translate') },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(HeaderComponent);
    header = fixture.debugElement.componentInstance;
    router = TestBed.inject(Router);
    keycloak = TestBed.inject(Keycloak);
    fixture.detectChanges();
  };

  describe('Without Parameter', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should initialise searchString according to the route', () => {
      // Evaluate signal value via method execution ()
      expect(header.searchString()).toBeFalsy();
    });

    it('should toggle the signin menu', () => {
      expect(header.openSignIn()).toBe(false);
      header.toggleSignInMenu();
      expect(header.openSignIn()).toBe(true);
      header.toggleSignInMenu();
      expect(header.openSignIn()).toBe(false);
    });

    it('should generate the profile url', () => {
      expect(header.urlProfile()).toBeTruthy();
    });

    it('should go to the login page', () => {
      header.toggleSignInMenu();
      expect(header.openSignIn()).toBe(true);
      spyOn(keycloak, 'login');

      header.gotoLogin();

      expect(header.openSignIn()).toBe(false);
      expect(keycloak.login).toHaveBeenCalledWith({
        redirectUri: 'http://localhost:9876/dashboard'
      });
    });

    it('should execute a search', () => {
      spyOn(router, 'navigate');

      header.executeSearch('123');
      expect(router.navigate).toHaveBeenCalledWith(['/home']);

      // Overwrite the dependencies inside the instance context
      Object.defineProperty(header, 'keycloak', { value: keyCloakLoggedIn });

      header.executeSearch('123');
      expect(router.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: {
          searchString: '123'
        }
      });
    });

    it('should logout', () => {
      Object.defineProperty(header, 'keycloak', { value: keyCloakLoggedIn });
      header.openSignIn.set(true);
      spyOn(keyCloakLoggedIn, 'logout');

      header.logOut();
      expect(keyCloakLoggedIn.logout).toHaveBeenCalled();
      expect(header.openSignIn()).toBeFalsy();
    });

    it('should close the signin if clicked outside', () => {
      header.toggleSignInMenu();
      expect(header.openSignIn()).toBe(true);
      header.onClickedOutsideUser(new Event('click'));
      expect(header.openSignIn()).toBe(false);
    });
  });

  describe('With Parameter', () => {
    beforeEach(() => {
      configureTestbed('abc');
      b4Each();
    });

    it('should initialise searchString according to the route', () => {
      expect(header.searchString()).toEqual('abc');
    });
  });
});
