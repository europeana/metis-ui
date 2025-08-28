import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';

import { mockedKeycloak, MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { UserDataService } from '../_services';
import { MockUserDataService } from '../_mocked';

import { HomeComponent } from '.';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHttp: MockHttp;

  const configureTestbed = (loggedIn = false): void => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UserDataService,
          useClass: MockUserDataService
        },
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return { type: loggedIn ? KeycloakEventType.Ready : KeycloakEventType.AuthLogout };
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  };

  const b4Each = (loggedIn = false): void => {
    configureTestbed(loggedIn);
    fixture = TestBed.createComponent(HomeComponent);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    mockHttp.verify();
  });

  describe('No login', () => {
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should emit events', () => {
      spyOn(component.appEntryLink, 'emit');
      component.clickEvent(({} as unknown) as Event);
      expect(component.appEntryLink.emit).toHaveBeenCalled();
    });

    it('should not init', () => {
      spyOn(component, 'initUserData');
      fixture.detectChanges();
      expect(component.initUserData).not.toHaveBeenCalled();
    });
  });

  describe('With login', () => {
    beforeEach(() => {
      b4Each(true);
    });

    it('should init', () => {
      spyOn(component, 'initUserData');
      fixture.detectChanges();
      expect(component.initUserData).toHaveBeenCalled();
    });

    it('should load the user profile', fakeAsync(() => {
      const details1 = {};
      const details2 = { username: 'jim' };

      let result = details1;
      spyOn(mockedKeycloak, 'loadUserProfile').and.callFake(() => {
        return new Promise((resolve) => {
          resolve(result);
        });
      });
      tick(1);
      fixture.detectChanges();

      expect(mockedKeycloak.loadUserProfile).toHaveBeenCalled();
      expect(component.userName).toBeFalsy();

      result = details2;
      component.initUserData();
      tick(1);
      fixture.detectChanges();

      expect(mockedKeycloak.loadUserProfile).toHaveBeenCalledTimes(2);
      expect(component.userName).toEqual('Jim');
    }));
  });
});
