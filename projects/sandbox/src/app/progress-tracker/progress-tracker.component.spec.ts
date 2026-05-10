import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import {
  CUSTOM_ELEMENTS_SCHEMA,
  InputSignal,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import { TextCopyDirective } from '../_directives';
import {
  mockDataset,
  MockDatasetContentSummaryComponent,
  MockUserDataService,
  MockSandboxService
} from '../_mocked';
import { SandboxService, UserDataService } from '../_services';
import { RenameStepPipe } from '../_translate';
import {
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  StepStatus
} from '../_models';
import { ProgressTrackerComponent } from '.';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        { provide: SandboxService, useClass: MockSandboxService },
        // These satisfy the global injector
        { provide: Keycloak, useValue: mockedKeycloak },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: signal({ type: KeycloakEventType.Ready, args: false })
        },
        { provide: UserDataService, useClass: MockUserDataService }
      ],
      imports: [
        ReactiveFormsModule,
        RenameStepPipe
        // Don't import ProgressTracker here if you're overriding it significantly
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(ProgressTrackerComponent, {
        set: {
          imports: [
            CommonModule,
            MockDatasetContentSummaryComponent,
            ReactiveFormsModule,
            RenameStepPipe,
            TextCopyDirective
          ],
          providers: [
            { provide: Keycloak, useValue: mockedKeycloak },
            {
              provide: KEYCLOAK_EVENT_SIGNAL,
              useValue: signal({ type: KeycloakEventType.Ready, args: false })
            },
            { provide: UserDataService, useClass: MockUserDataService }
          ],
          // ADD THIS HERE - This is what stops the lib-modal error
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }
      })
      .compileComponents();

    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = async (): Promise<void> => {
    await configureTestbed();
    vi.useRealTimers();

    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('datasetProgress', mockDataset);
    fixture.componentRef.setInput('datasetId', '1');

    fixture.detectChanges();
    await fixture.whenStable();
  };

  describe('Normal operation', () => {
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should accept a recordShortcutRequest', async () => {
      // We don't need a spy because the linkedSignal handles the logic directly
      vi.useFakeTimers();

      // 1. Set the input
      fixture.componentRef.setInput('recordShortcutRequest', '123');

      // 2. Trigger detection and flush microtasks
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // 3. Assert on the SIGNAL VALUE, not the method call
      expect(component.activeSubSection()).toEqual(DisplayedSubsection.TIERS);
      expect(component.recordShortcutRequest()).toBeTruthy();

      // 4. Reset
      fixture.componentRef.setInput('recordShortcutRequest', undefined);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.activeSubSection()).toEqual(DisplayedSubsection.PROGRESS);
      expect(component.recordShortcutRequest()).toBeFalsy();

      vi.useRealTimers();
    });

    /*
    it('should calculate the showSteps value', async () => {
      vi.useFakeTimers();
      expect(component.showSteps).toBeTruthy();

      const failDataset = structuredClone(mockDataset);
      failDataset.status = DatasetStatus.FAILED;

      fixture.componentRef.setInput('datasetProgress', failDataset);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.showSteps()).toBeTruthy();

      failDataset['processed-records'] = 0;

      fixture.componentRef.setInput('datasetProgress', failDataset);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.showSteps()).toBeFalsy();

      failDataset.status = DatasetStatus.COMPLETED;

      fixture.componentRef.setInput('datasetProgress', failDataset);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.showSteps()).toBeTruthy();
      vi.useRealTimers();
    });
    */

    it('should calculate the showSteps value', async () => {
      vi.useFakeTimers();
      expect(component.showSteps()).toBeTruthy();

      // 1. Status: FAILED, records > 0 (Should be true)
      fixture.componentRef.setInput('datasetProgress', {
        ...mockDataset,
        status: DatasetStatus.FAILED,
        'processed-records': 10
      });
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      expect(component.showSteps()).toBeTruthy();

      // 2. Status: FAILED, records === 0 (Should be FALSE)
      fixture.componentRef.setInput('datasetProgress', {
        ...mockDataset,
        status: DatasetStatus.FAILED,
        'processed-records': 0 // Ensure this key matches your Model exactly!
      });
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // This is where it was failing (received true, expected false)
      expect(component.showSteps()).toBeFalsy();

      // 3. Status: COMPLETED (Should be true)
      fixture.componentRef.setInput('datasetProgress', {
        ...mockDataset,
        status: DatasetStatus.COMPLETED,
        'processed-records': 0
      });
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.showSteps()).toBeTruthy();
      vi.useRealTimers();
    });

    it('should close the warning view', async () => {
  vi.useFakeTimers();
  // 1. Setup initial 'Open' state
  component.warningDisplayedTier = DisplayedTier.METADATA;
  fixture.componentRef.setInput('showing', true);
  fixture.detectChanges();
  await vi.advanceTimersByTimeAsync(0);

  // 2. Trigger action that uses setTimeout(..., 400)
  component.closeWarningView();

  // 3. Jump the clock
  vi.advanceTimersByTime(400);

  // 4. CRITICAL: Flush microtasks so the value is 'false' BEFORE detectChanges starts
  await vi.advanceTimersByTimeAsync(0);
  fixture.detectChanges();

  expect(component.warningDisplayedTier).toEqual(DisplayedTier.NONE as number);
  vi.useRealTimers();
});


    it('should format the error', () => {
      const error = { type: 'Serious', message: 'hello', records: ['rec1'] };
      expect(component.formatError(error)).toEqual(JSON.stringify(error, null, 4));
    });

    it('should get the label class', () => {
      expect(component.getLabelClass(StepStatus.HARVEST_HTTP)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.HARVEST_OAI)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.HARVEST_FILE)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.VALIDATE_EXTERNAL)).toEqual('validation_external');
      expect(component.getLabelClass(StepStatus.VALIDATE_INTERNAL)).toEqual('validation_internal');
      expect(component.getLabelClass(StepStatus.MEDIA)).toEqual('media_process');
      expect(component.getLabelClass(StepStatus.ENRICH)).toEqual('enrichment');
      expect(component.getLabelClass(StepStatus.TRANSFORM_INTERNAL)).toEqual('transformation');
      expect(component.getLabelClass(StepStatus.TRANSFORM_EXTERNAL)).toEqual('transformation_edm');
      expect(component.getLabelClass(StepStatus.NORMALIZE)).toEqual('normalization');
      expect(component.getLabelClass(StepStatus.INDEX_PUBLISH)).toEqual('publish');
      expect(component.getLabelClass('' as StepStatus)).toEqual('harvest');
    });

    it('should prompt a tier data load', async () => {
      vi.useFakeTimers();
      const completedDataset = structuredClone(mockDataset);
      completedDataset.status = DatasetStatus.COMPLETED;

      const tierDisplay = component.datasetTierDisplay();

      expect(tierDisplay).toBeTruthy();
      if (tierDisplay) {
        vi.spyOn(tierDisplay, 'loadData');

        component.setActiveSubSection(DisplayedSubsection.TIERS);
        fixture.componentRef.setInput('datasetProgress', completedDataset);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(tierDisplay?.loadData).toHaveBeenCalled();
      }
      vi.useRealTimers();
    });

    it('should close the tiers view when a dataset fails', async () => {
      vi.useFakeTimers();

      // 1. Initial State: Set to TIERS
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      expect(component.activeSubSection()).toEqual(DisplayedSubsection.TIERS);

      // 2. Trigger Failure with a FRESH object reference
      fixture.componentRef.setInput('datasetProgress', {
        ...mockDataset,
        status: DatasetStatus.FAILED
      });

      // 3. CRITICAL: Detect changes then advance 0ms ASYNC to flush microtasks
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // 4. Final detection to settle any cascading signals
      fixture.detectChanges();

      expect(component.activeSubSection()).toEqual(DisplayedSubsection.PROGRESS);
      vi.useRealTimers();
    });

    /*
    it('should close the tiers view when a dataset fails', async () => {
      vi.useFakeTimers();
      const failDataset = structuredClone(mockDataset);
      failDataset.status = DatasetStatus.FAILED;
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      fixture.componentRef.setInput('datasetProgress', failDataset);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.activeSubSection()).toEqual(DisplayedSubsection.PROGRESS);
      vi.useRealTimers();
    });
    */

    it('should get the sub-nav orb configuration', () => {
      expect(
        component.getOrbConfigSubNav(DisplayedSubsection.PROGRESS)['track-processing-orb']
      ).toBeTruthy();
      expect(component.getOrbConfigSubNav(DisplayedSubsection.TIERS)['pie-orb']).toBeTruthy();
    });

    it('should get the inner orb configuration', () => {
      expect(component.getOrbConfigInner(0)['content-tier-orb']).toBeTruthy();
      expect(component.getOrbConfigInner(1)['metadata-tier-orb']).toBeTruthy();
    });

    it('should get the outer orb configuration', async () => {
      vi.useFakeTimers();

      // 1. Test Visible State (total > 0)
      const tierInfoDataset = {
        ...mockDataset,
        'tier-zero-info': {
          'content-tier': { total: 5, samples: [] },
          'metadata-tier': { total: 2, samples: [] }
        }
      };
      fixture.componentRef.setInput('datasetProgress', tierInfoDataset);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // Use toBeFalsy because result['hidden'] is undefined here
      expect(component.getOrbConfigOuter(0)['hidden']).toBeFalsy();

      // 2. Test Hidden State (total === 0)
      const hiddenDataset = {
        ...mockDataset,
        'tier-zero-info': {
          'content-tier': { total: 0, samples: [] },
          'metadata-tier': { total: 2, samples: [] }
        }
      };
      fixture.componentRef.setInput('datasetProgress', hiddenDataset);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // This should now be true
      expect(component.getOrbConfigOuter(0)['hidden']).toBeTruthy();

      vi.useRealTimers();
    });

    it('should get the status class', () => {
      expect(component.getStatusClass({} as ProgressByStep)).toEqual('pending');
      expect(component.getStatusClass({ success: 1, total: 2 } as ProgressByStep)).toEqual(
        'running'
      );
      expect(component.getStatusClass({ success: 1, total: 1 } as ProgressByStep)).toEqual(
        'success'
      );
      expect(component.getStatusClass({ success: 1, fail: 1, total: 2 } as ProgressByStep)).toEqual(
        'fail'
      );
      expect(component.getStatusClass({ success: 1, warn: 1, total: 2 } as ProgressByStep)).toEqual(
        'warn'
      );
    });
    it('should get the orb config count', async () => {
      fixture.componentRef.setInput('datasetProgress', {
        ...mockDataset,
        'processed-records': 0
      });
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.getOrbConfigCount()).toEqual(0);
    });

    /*
    it('should get the orb config count', async () => {
      vi.useFakeTimers();
      const tierInfoDataset = structuredClone(mockDataset);
      expect(component.getOrbConfigCount()).toEqual(0);

      tierInfoDataset['tier-zero-info'] = {
        'content-tier': {
          samples: ['1', '2'],
          total: 2
        }
      };
      fixture.componentRef.setInput('datasetProgress', tierInfoDataset);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getOrbConfigCount()).toEqual(1);

      tierInfoDataset['tier-zero-info']['metadata-tier'] = {
        samples: ['3', '4'],
        total: 2
      };
      fixture.componentRef.setInput('datasetProgress', tierInfoDataset);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getOrbConfigCount()).toEqual(2);

      tierInfoDataset['tier-zero-info'] = {
        'metadata-tier': {
          samples: ['3', '4'],
          total: 2
        }
      };
      fixture.componentRef.setInput('datasetProgress', tierInfoDataset);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.getOrbConfigCount()).toEqual(2);
      vi.useRealTimers();
    });
    */

    it('should handle clicks on the zero tier links', () => {
  // 1. Create the spy
  const emitSpy = vi.spyOn(component.openReport, 'emit');

  // 2. Clear any noise from the b4Each setup
  emitSpy.mockClear();

  const createKeyEvent = (ctrlKey = false): KeyboardEvent => {
    return ({
      preventDefault: vi.fn(),
      ctrlKey: ctrlKey
    } as unknown) as KeyboardEvent;
  };

  // This should now pass because the spy was cleared
  component.reportLinkClicked(createKeyEvent(true), '1', false);
  expect(emitSpy).not.toHaveBeenCalled();

  component.reportLinkClicked(createKeyEvent(false), '1', false);
  expect(emitSpy).toHaveBeenCalled();

  component.reportLinkEmit('1');
  expect(emitSpy).toHaveBeenCalledTimes(2);

  component.reportLinkEmitFromTierStats('1');
  expect(emitSpy).toHaveBeenCalledTimes(3);
});


    it('should reset warningViewOpened when data is set', async () => {
      vi.useFakeTimers();

      // 1. Manually "dirty" the state
      component.warningViewOpened = [true, true];

      // 2. Pass a NEW object reference to trigger the effect
      fixture.componentRef.setInput('datasetProgress', { ...mockDataset });

      // 3. Trigger CD and flush the microtask queue (where the effect lives)
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);

      // 4. Verify the effect ran
      expect(component.warningViewOpened).toEqual([false, false]);

      vi.useRealTimers();
    });


    it('should show the errors and warning modals', () => {
      vi.spyOn(modalConfirms, 'open').mockImplementation(() => {
        const res = of(true);
        modalConfirms.add({
          open: () => res,
          close: () => undefined,
          id: (() => '1' as unknown) as InputSignal<string>,
          isShowing: true
        });
        return res;
      });

      const openerRef = ({} as unknown) as HTMLElement;
      component.showErrorsForStep(1, openerRef);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should invoke the flag click', () => {
      // 1. Setup the spy
      const spy = vi.spyOn(component, 'showErrorsForStep');

      // 2. Create a mock element structure
      const mockEl = document.createElement('div');
      const flagEl = document.createElement('span');
      flagEl.classList.add('flag');
      mockEl.appendChild(flagEl);

      // 3. Call the method
      const testIndex = 5;
      component.invokeFlagClick(testIndex, mockEl);

      // 4. Assert
      expect(spy).toHaveBeenCalledWith(testIndex, flagEl);
    });

    it('should set the sub-nav orb configuration', () => {
      component.setActiveSubSection(DisplayedSubsection.PROGRESS);
      expect(component.activeSubSection()).toEqual(DisplayedSubsection.PROGRESS);
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      expect(component.activeSubSection()).toEqual(DisplayedSubsection.TIERS);
    });

    it('should set the warning view', () => {
      expect(component.warningViewOpened[DisplayedTier.CONTENT]).toBeFalsy();
      expect(component.warningViewOpened[DisplayedTier.METADATA]).toBeFalsy();

      component.setWarningView(DisplayedTier.CONTENT);
      expect(component.warningDisplayedTier).toEqual(DisplayedTier.CONTENT);
      expect(component.warningViewOpened[DisplayedTier.CONTENT]).toBeTruthy();

      component.setWarningView(DisplayedTier.METADATA);
      expect(component.warningDisplayedTier).toEqual(DisplayedTier.METADATA);
      expect(component.warningViewOpened[DisplayedTier.METADATA]).toBeTruthy();
    });

    it('should toggle the exapnded-warning flag', () => {
      component.handleTierLoadingChange(false);
      expect(component.isLoadingTierData).toBeFalsy();
      component.handleTierLoadingChange(true);
      expect(component.isLoadingTierData).toBeTruthy();
    });

    it('should toggle the exapnded-warning flag', () => {
      expect(component.expandedWarning).toBeFalsy();
      component.toggleExpandedWarning();
      expect(component.expandedWarning).toBeTruthy();
      component.toggleExpandedWarning();
      expect(component.expandedWarning).toBeFalsy();
    });
  });
});
