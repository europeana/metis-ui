import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { KeycloakSignoutCheckDirective } from './keycloak-signout-check.directive';

@Component({
  template: `
    <div libKeycloakSignoutCheck></div>
  `,
  imports: [KeycloakSignoutCheckDirective]
})
class TestKeycloakSignoutCheckComponent {}

describe('KeycloakSignoutCheckDirective (Lean & Behavioral)', () => {
  let fixture: ComponentFixture<TestKeycloakSignoutCheckComponent>;
  let cookies: CookieService;
  let mockKeycloak: any;

  // High utility pivot: A real signal that lets us feed events dynamically into the directive constructor effect
  let keycloakEventSignal: any;

  beforeEach(async () => {
    // Standard mock setup
    keycloakEventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.Ready,
      args: false
    });

    mockKeycloak = {
      authenticated: true,
      logout: vi.fn().mockResolvedValue(true)
    };

    const mockCookieService = {
      get: vi.fn().mockReturnValue('no'),
      set: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TestKeycloakSignoutCheckComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: CookieService, useValue: mockCookieService },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakEventSignal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestKeycloakSignoutCheckComponent);
    cookies = TestBed.inject(CookieService);
  });

  it('should initialize the directive and default cookie mapping', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should set cookie value to no when keycloak signals user is logged in', async () => {
    keycloakEventSignal.set({ type: KeycloakEventType.Ready, args: true });
    fixture.detectChanges();
    await TestBed.flushEffects();

    expect(cookies.set).toHaveBeenCalledWith(
      KeycloakSignoutCheckDirective.cookieUserSignedOut,
      'no',
      expect.any(Object)
    );
  });

  it('should set cookie value to yes when an AuthLogout event stream triggers', async () => {
    keycloakEventSignal.set({ type: KeycloakEventType.AuthLogout, args: null });
    fixture.detectChanges();
    await TestBed.flushEffects();

    expect(cookies.set).toHaveBeenCalledWith(
      KeycloakSignoutCheckDirective.cookieUserSignedOut,
      'yes',
      expect.any(Object)
    );
  });

  it('should enforce single sign out when document visibility returns to active viewports', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    // Behavior: Simulate the user logging out in a different browser tab
    vi.spyOn(cookies, 'get').mockReturnValue('yes');
    mockKeycloak.authenticated = true;

    // Simulate document changing tabs
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    fixture.detectChanges();
    expect(mockKeycloak.logout).toHaveBeenCalled();
  });
});
