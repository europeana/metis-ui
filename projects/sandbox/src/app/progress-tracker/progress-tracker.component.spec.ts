import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ProgressTrackerComponent } from './progress-tracker.component';
import { mockDatasetInfo } from '../_mocked';
import { DatasetInfoStatus, ProgressByStep, StepStatus } from '../_models';
import { MockModalConfirmService, ModalConfirmService } from '@shared';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [{ provide: ModalConfirmService, useClass: MockModalConfirmService }],
      declarations: [ProgressTrackerComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = () => {
    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;
    component.progressData = mockDatasetInfo;
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should open the modal', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(true);
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
        return res;
      });
      component.confirmModalErrors(1);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should report if links are available', () => {
      expect(component.hasLinks()).toBeTruthy();
      mockDatasetInfo['portal-preview'] = undefined;
      expect(component.hasLinks()).toBeTruthy();
      mockDatasetInfo['portal-publish'] = undefined;
      expect(component.hasLinks()).toBeFalsy();
    });

    it('should report if complete', () => {
      expect(component.isComplete()).toBeTruthy();
      mockDatasetInfo.status = DatasetInfoStatus.IN_PROGRESS;
      expect(component.isComplete()).toBeFalsy();
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

    it('should get the link prefixes', () => {
      expect(component.getLinkPrefixes().viewCollections).toBeTruthy();
      expect(component.getLinkPrefixes().viewPreview).toBeTruthy();
    });

    it('should get the label class', () => {
      expect(component.getLabelClass(StepStatus.IMPORT)).toEqual('harvest');
      expect(component.getLabelClass(StepStatus.VALIDATE_EXTERNAL)).toEqual('validation_external');
      expect(component.getLabelClass(StepStatus.VALIDATE_EXTERNAL)).toEqual('validation_external');
      expect(component.getLabelClass(StepStatus.VALIDATE_INTERNAL)).toEqual('validation_internal');
      expect(component.getLabelClass(StepStatus.PROCESS_MEDIA)).toEqual('media_process');
      expect(component.getLabelClass(StepStatus.ENRICH)).toEqual('enrichment');
      expect(component.getLabelClass(StepStatus.TRANSFORM)).toEqual('transformation');
      expect(component.getLabelClass(StepStatus.NORMALISE)).toEqual('normalization');
      expect(component.getLabelClass(StepStatus.PREVIEW)).toEqual('preview');
      expect(component.getLabelClass(StepStatus.PUBLISH)).toEqual('publish');
      expect(component.getLabelClass('' as StepStatus)).toEqual('');
    });
  });
});
