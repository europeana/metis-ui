import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';

import { mockedKeycloak, MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { DropInService } from '../_services';
import { MockDropInService } from '../_mocked';

import { HomeComponent } from '.';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHttp: MockHttp;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: DropInService,
          useClass: MockDropInService
        },
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ({} as unknown) as KeycloakEvent;
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(HomeComponent);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit events', () => {
    spyOn(component.appEntryLink, 'emit');
    component.clickEvent(({} as unknown) as Event);
    expect(component.appEntryLink.emit).toHaveBeenCalled();
  });
});
