import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeycloakAuthService } from '../_services/keycloak-auth.service'; // Adjust path if needed
import { SandboxService } from '../_services/sandbox.service'; // Adjust path if needed
import { of } from 'rxjs';
import { HomeComponent } from '.';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        // 🚀 Ensure zoneless testing environments run correctly
        provideZonelessChangeDetection(),

        // 🚀 Fix: Mock the KeycloakAuthService with its dependent methods/signals
        {
          provide: KeycloakAuthService,
          useValue: {
            isAuthenticated: vi.fn().mockReturnValue(true),
            userProfile: vi.fn().mockReturnValue({ username: 'sandbox-user' }),
            username: signal('sandbox-user')
          }
        },

        // 🚀 Fix: Provide basic mock services required during initialization resources
        {
          provide: SandboxService,
          useValue: {
            getDatasetInfo: vi.fn().mockReturnValue(of(undefined))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Explicitly await the view setup stability
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
