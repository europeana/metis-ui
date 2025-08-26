import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';
import { mockedKeycloak } from 'shared';

import { DropInService } from '../_services';
import { MockDropInService } from '../_mocked';

import { RecentComponent } from '.';

describe('RecentComponent', () => {
  let component: RecentComponent;
  let fixture: ComponentFixture<RecentComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [RecentComponent],
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
    fixture = TestBed.createComponent(RecentComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu', () => {
    component.menuOpen = false;
    component.toggleMenu();
    expect(component.menuOpen).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalsy();
    component.toggleMenu();
    expect(component.menuOpen).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalsy();
  });

  it('should emit events', () => {
    spyOn(component.showAllRecent, 'emit');
    component.showAll();
    expect(component.showAllRecent.emit).toHaveBeenCalled();
  });
});
