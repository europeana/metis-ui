import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { mockedKeycloak } from '../../../_mocked/mockedkeycloak';
import { KeycloakSignoutCheckDirective } from './keycloak-signout-check.directive';

@Component({
  template: `
    <div libKeycloakSignoutCheck></div>
  `,
  imports: [KeycloakSignoutCheckDirective],
  styles: ['.collapsed{ background-color: red; }']
})
class TestKeycloakSignoutCheckComponent {}

describe('KeycloakSignoutCheckDirective', () => {
  let fixture: ComponentFixture<TestKeycloakSignoutCheckComponent>;
  let cookies: CookieService;
  let keycloak: Keycloak;

  const configure = (ev: KeycloakEvent): void => {
    TestBed.configureTestingModule({
      imports: [KeycloakSignoutCheckDirective, TestKeycloakSignoutCheckComponent],
      providers: [
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ev;
          }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TestKeycloakSignoutCheckComponent);
    cookies = TestBed.inject(CookieService);
    keycloak = TestBed.inject(Keycloak);
  };

  it('is should create', () => {
    configure({
      type: KeycloakEventType.Ready,
      args: false
    });
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('it should set the logout cookie flag', () => {
    configure({
      type: KeycloakEventType.AuthLogout,
      args: true
    });
    spyOn(cookies, 'set');
    fixture.detectChanges();
    expect(cookies.set).toHaveBeenCalledWith(
      KeycloakSignoutCheckDirective.cookieUserSignedOut,
      'yes',
      { path: '/' }
    );
  });

  it('it should set the signout cookie when logged in', () => {
    configure({
      type: KeycloakEventType.Ready,
      args: true
    });
    spyOn(cookies, 'set');
    fixture.detectChanges();
    expect(cookies.set).toHaveBeenCalledWith(
      KeycloakSignoutCheckDirective.cookieUserSignedOut,
      'no',
      { path: '/' }
    );
  });

  it('it should set the signout cookie when not logged in', () => {
    configure({
      type: KeycloakEventType.Ready,
      args: false
    });
    spyOn(cookies, 'set');
    fixture.detectChanges();
    expect(cookies.set).toHaveBeenCalledWith(
      KeycloakSignoutCheckDirective.cookieUserSignedOut,
      'yes',
      { path: '/' }
    );
  });

  it('it should logout when visibility changes', () => {
    configure({
      type: KeycloakEventType.Ready,
      args: false
    });
    fixture.detectChanges();
    spyOn(keycloak, 'logout');
    spyOn(cookies, 'set');
    expect(keycloak.logout).not.toHaveBeenCalled();
    document.dispatchEvent(new Event('visibilitychange'));
    fixture.detectChanges();
    expect(keycloak.logout).toHaveBeenCalled();
  });
});
