import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { MockSandboxService } from '../_mocked';
import { DatasetStatus } from '../_models';
import { SandboxService } from '../_services';
import { DatasetInfoComponent } from '.';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DatasetInfoComponent],
      providers: [
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: MockSandboxService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetInfoComponent);
    component = fixture.componentInstance;
  };

  const getConfirmResult = (): Observable<boolean> => {
    const res = of(true);
    modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
    return res;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.datasetInfo).toBeFalsy();
  });

  it('should assist with tooltip display', () => {
    expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
    component.status = DatasetStatus.COMPLETED;
    expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
    component.showCross = true;
    expect(component.showTooltipCompletedWithErrors()).toBeTruthy();
  });

  it('should load the dataset info', fakeAsync(() => {
    expect(component.datasetId).toBeFalsy();
    expect(component.datasetInfo).toBeFalsy();

    component.datasetId = '1';
    tick(1);

    expect(component.datasetInfo).toBeTruthy();
  }));

  it('should set the progress data', () => {
    const data = {
      'dataset-logs': [],
      'records-published-successfully': false,
      status: DatasetStatus.FAILED,
      'processed-records': 0,
      'total-records': 0,
      'progress-by-step': []
    };
    component.progressData = undefined;

    expect(component.progressData).toBeFalsy();
    component.progressData = data;

    expect(component.noPublishedRecordAvailable).toBeFalsy();
    expect(component.showTick).toBeFalsy();
    expect(component.showCross).toBeTruthy();

    data.status = DatasetStatus.IN_PROGRESS;
    component.progressData = data;

    expect(component.showCross).toBeFalsy();
    expect(component.showTick).toBeFalsy();

    data['records-published-successfully'] = true;
    component.progressData = data;

    expect(component.showTick).toBeFalsy();

    data.status = DatasetStatus.COMPLETED;
    component.progressData = data;

    expect(component.showTick).toBeTruthy();
  });

  it('should show the modal for incomplete data', () => {
    spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
    component.showDatasetIssues();
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should show the modal for processing errors', () => {
    spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
    component.showProcessingErrors();
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should toggle fullInfoOpen', () => {
    expect(component.fullInfoOpen).toBeFalsy();
    component.toggleFullInfoOpen();
    expect(component.fullInfoOpen).toBeTruthy();
    component.toggleFullInfoOpen();
    expect(component.fullInfoOpen).toBeFalsy();
  });

  it('should close fullInfoOpen', () => {
    component.fullInfoOpen = true;
    component.closeFullInfo();
    expect(component.fullInfoOpen).toBeFalsy();
    component.closeFullInfo();
    expect(component.fullInfoOpen).toBeFalsy();
  });
});
