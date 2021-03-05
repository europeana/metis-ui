import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProgressTrackerComponent } from './progress-tracker.component';
import { testDatasetInfo } from '../_mocked';
import { ProgressByStep, StepStatus } from '../_models';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgressTrackerComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;
    component.progressData = testDatasetInfo[0];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the status class', () => {
    expect(component.getStatusClass({ success: 1, total: 1 } as ProgressByStep)).toEqual('success');
    expect(component.getStatusClass({ success: 1, fail: 1, total: 2 } as ProgressByStep)).toEqual(
      'fail'
    );
    expect(component.getStatusClass({ success: 1, warn: 1, total: 2 } as ProgressByStep)).toEqual(
      'warn'
    );
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
  });
});
