import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { mockedKeycloak } from 'shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SandboxPageType } from '../_models';
import { HighlightMatchPipe } from '../_translate';
import { SandboxNavigatonComponent } from './sandbox-navigation.component';

describe('SandboxNavigatonComponent', () => {
  let component: SandboxNavigatonComponent;
  let fixture: ComponentFixture<SandboxNavigatonComponent>;

  const mockActivatedRoute = {
    params: of({ id: '853' }),
    queryParams: of({ recordId: '123' }),
    snapshot: {
      paramMap: convertToParamMap({ id: '853' }),
      queryParamMap: convertToParamMap({ recordId: '123' })
    }
  };

  const configureTestbed = (routeMock: any = mockActivatedRoute): void => {
    TestBed.configureTestingModule({
      imports: [SandboxNavigatonComponent, ReactiveFormsModule],
      providers: [
        { provide: Keycloak, useValue: mockedKeycloak },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => ({ type: KeycloakEventType.Ready })
        },
        { provide: ActivatedRoute, useValue: routeMock },
        HighlightMatchPipe,
        provideHttpClient()
      ]
    }).compileComponents();
  };

  const setupComponentContext = (): void => {
    // 🚀 THE INJECTION CONTEXT GUARD: Guarantees explicit safety for cold start signal stream initializations
    TestBed.runInInjectionContext((): void => {
      fixture = TestBed.createComponent(SandboxNavigatonComponent);
      component = fixture.componentInstance;
    });
  };

  describe('Normal Operations', () => {
    beforeEach((): void => {
      configureTestbed();
      vi.useFakeTimers();
      setupComponentContext();
    });

    beforeAll((): void => {
      global.ResizeObserver = class implements ResizeObserver {
        public observe(): void {
          vi.fn();
        }
        public unobserve(): void {
          vi.fn();
        }
        public disconnect(): void {
          vi.fn();
        }
      };
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    afterAll((): void => {
      vi.useRealTimers();
    });

    it('should initialize cleanly with default HOME parameters', (): void => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.currentStepType()).toBe(SandboxPageType.HOME);
    });

    it('should navigate straight to Record Report when landing on deep links', async (): Promise<
      void
    > => {
      fixture.detectChanges();
      TestBed.flushEffects();

      // 🚀 THE TIMING FIX: Yields control block execution back to the browser runtime loop
      // allowing the internal queueMicrotask validation loops to finish processing
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.currentStepType()).toBe(SandboxPageType.REPORT);
    });

    it('should maintain the active deep-linked page selection when data updates land', async (): Promise<
      void
    > => {
      fixture.detectChanges();
      TestBed.flushEffects();

      // 🚀 THE TIMING FIX: Yields control block execution back to the browser runtime loop
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.currentStepType()).toBe(SandboxPageType.REPORT);

      // Simulate secondary stream changes landing on top of the active workspace
      component.formProgress.controls['datasetToTrack'].setValue('853');
      component.formProgress.updateValueAndValidity();

      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.currentStepType()).toBe(SandboxPageType.REPORT);
    });
  });
});
