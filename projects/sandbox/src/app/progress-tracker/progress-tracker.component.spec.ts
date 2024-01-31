import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ProgressTrackerComponent } from './progress-tracker.component';
import { DatasetContentSummaryComponent } from '../dataset-content-summary';
import { mockDataset } from '../_mocked';
import { RenameStepPipe } from '../_translate';
import {
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  StepStatus
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [{ provide: ModalConfirmService, useClass: MockModalConfirmService }],
      declarations: [ProgressTrackerComponent, RenameStepPipe],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;
    component.progressData = mockDataset;
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should close the warning view', fakeAsync(() => {
      const tickTime = 400;
      component.warningDisplayedTier = DisplayedTier.METADATA;
      component.closeWarningView();
      tick(tickTime);
      expect(component.warningDisplayedTier).toEqual(DisplayedTier.METADATA);
      component.showing = true;
      component.closeWarningView();
      tick(tickTime);
      expect(component.warningDisplayedTier).toEqual(DisplayedTier.NONE as number);
    }));

    it('should format the error', () => {
      const error = { type: 'Serious', message: 'hello', records: ['rec1'] };
      expect(component.formatError(error)).toEqual(JSON.stringify(error, null, 4));
    });

    it('should get the label class', () => {
      expect(component.getLabelClass(StepStatus.HARVEST_HTTP)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.HARVEST_OAI_PMH)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.HARVEST_FILE)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.VALIDATE_EXTERNAL)).toEqual('validation_external');
      expect(component.getLabelClass(StepStatus.VALIDATE_INTERNAL)).toEqual('validation_internal');
      expect(component.getLabelClass(StepStatus.MEDIA_PROCESS)).toEqual('media_process');
      expect(component.getLabelClass(StepStatus.ENRICH)).toEqual('enrichment');
      expect(component.getLabelClass(StepStatus.TRANSFORM)).toEqual('transformation');
      expect(component.getLabelClass(StepStatus.TRANSFORM_TO_EDM_EXTERNAL)).toEqual(
        'transformation_edm'
      );
      expect(component.getLabelClass(StepStatus.NORMALIZE)).toEqual('normalization');
      expect(component.getLabelClass(StepStatus.PUBLISH)).toEqual('publish');
      expect(component.getLabelClass('' as StepStatus)).toEqual('harvest');
    });

    it('should prompt a tier data load', () => {
      const completedDataset = structuredClone(mockDataset);
      completedDataset.status = DatasetStatus.COMPLETED;
      component.datasetTierDisplay = ({
        loadData: jasmine.createSpy()
      } as unknown) as DatasetContentSummaryComponent;
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      component.progressData = completedDataset;
      expect(component.datasetTierDisplay.loadData).toHaveBeenCalled();
    });

    it('should close the tiers view when a dataset fails', () => {
      const failDataset = structuredClone(mockDataset);
      failDataset.status = DatasetStatus.FAILED;
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      component.progressData = failDataset;
      expect(component.activeSubSection).toEqual(DisplayedSubsection.PROGRESS);
    });

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

    it('should get the outer orb configuration', () => {
      const tierInfoDataset = structuredClone(mockDataset);

      expect(component.getOrbConfigOuter(0)['hidden']).toBeFalsy();
      expect(component.getOrbConfigOuter(1)['hidden']).toBeFalsy();

      tierInfoDataset['tier-zero-info'] = {
        'content-tier': undefined,
        'metadata-tier': {
          samples: ['3', '4'],
          total: 2
        }
      };
      component.progressData = tierInfoDataset;
      expect(component.getOrbConfigOuter(0)['hidden']).toBeTruthy();
      expect(component.getOrbConfigOuter(1)['hidden']).toBeFalsy();

      tierInfoDataset['tier-zero-info'] = {
        'content-tier': {
          samples: ['1', '2'],
          total: 2
        },
        'metadata-tier': undefined
      };
      expect(component.getOrbConfigOuter(0)['hidden']).toBeFalsy();
      expect(component.getOrbConfigOuter(1)['hidden']).toBeFalsy();
    });

    it('should get the status class', () => {
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

    it('should get the orb config count', () => {
      const tierInfoDataset = structuredClone(mockDataset);
      expect(component.getOrbConfigCount()).toEqual(0);

      tierInfoDataset['tier-zero-info'] = {
        'content-tier': {
          samples: ['1', '2'],
          total: 2
        }
      };
      component.progressData = tierInfoDataset;
      expect(component.getOrbConfigCount()).toEqual(1);

      tierInfoDataset['tier-zero-info']['metadata-tier'] = {
        samples: ['3', '4'],
        total: 2
      };
      component.progressData = tierInfoDataset;
      expect(component.getOrbConfigCount()).toEqual(2);

      tierInfoDataset['tier-zero-info'] = {
        'metadata-tier': {
          samples: ['3', '4'],
          total: 2
        }
      };
      component.progressData = tierInfoDataset;
      expect(component.getOrbConfigCount()).toEqual(2);
    });

    it('should handle clicks on the zero tier links', () => {
      spyOn(component.openReport, 'emit');

      const createKeyEvent = (ctrlKey = false): KeyboardEvent => {
        return ({
          preventDefault: jasmine.createSpy(),
          ctrlKey: ctrlKey
        } as unknown) as KeyboardEvent;
      };

      component.reportLinkClicked(createKeyEvent(true), '1', false);
      expect(component.openReport.emit).not.toHaveBeenCalled();

      component.reportLinkClicked(createKeyEvent(false), '1', false);
      expect(component.openReport.emit).toHaveBeenCalled();

      component.reportLinkEmit('1');
      expect(component.openReport.emit).toHaveBeenCalledTimes(2);
    });

    it('should reset warningViewOpened when data is set', () => {
      component.warningViewOpened = [true, true];
      component.progressData = mockDataset;
      expect(component.warningViewOpened).toEqual([false, false]);

      component.warningViewOpened = [true, true];
      component.progressData = mockDataset;
      expect(component.warningViewOpened).toEqual([false, false]);
    });

    it('should show the errors and warning modals', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(true);
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
        return res;
      });
      component.showErrorsForStep(1);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should set the sub-nav orb configuration', () => {
      component.setActiveSubSection(DisplayedSubsection.PROGRESS);
      expect(component.activeSubSection).toEqual(DisplayedSubsection.PROGRESS);
      component.setActiveSubSection(DisplayedSubsection.TIERS);
      expect(component.activeSubSection).toEqual(DisplayedSubsection.TIERS);
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
