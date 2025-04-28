import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import Keycloak from 'keycloak-js';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDebiasComponent,
  MockDebiasService,
  mockedMatomoService,
  MockSandboxService
} from '../_mocked';
import { DatasetStatus, DebiasState } from '../_models';
import { DebiasService, MatomoService, SandboxService } from '../_services';
import { DebiasComponent } from '../debias';
import { DatasetInfoComponent } from '.';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;
  let matomo: MatomoService;
  const fakeElement = ({} as unknown) as HTMLElement;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DatasetInfoComponent],
      providers: [
        { provide: MatomoService, useValue: mockedMatomoService },
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: MockSandboxService
        },
        {
          provide: DebiasService,
          useClass: MockDebiasService
        },
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(DatasetInfoComponent, {
        remove: { imports: [DebiasComponent] },
        add: { imports: [MockDebiasComponent] }
      })
      .compileComponents();

    modalConfirms = TestBed.inject(ModalConfirmService);
    matomo = TestBed.inject(MatomoService);
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(DatasetInfoComponent);
    component = fixture.componentInstance;
  };

  const getConfirmResult = (): Observable<boolean> => {
    const res = of(true);
    modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
    return res;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.datasetInfo).toBeFalsy();
  });

  it('should track the user viewing the published records', () => {
    spyOn(matomo, 'trackNavigation');
    component.trackViewPublished();
    expect(matomo.trackNavigation).toHaveBeenCalledWith(['external', 'published-records']);
  });

  it('should assist with tooltip display', () => {
    expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
    component.status = DatasetStatus.COMPLETED;
    expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
    component.showCross = true;
    expect(component.showTooltipCompletedWithErrors()).toBeTruthy();
  });

  it('should load the dataset info', fakeAsync(() => {
    fixture.detectChanges();

    expect(component.datasetId).toBeFalsy();
    expect(component.datasetInfo).toBeFalsy();

    component.datasetId = '1';
    expect(component.datasetInfo).toBeFalsy();
    tick(1);
    expect(component.datasetInfo).toBeTruthy();
  }));

  it('should close open modals when the dataset id is set', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.modalDebias).toBeTruthy();
    spyOn(modalConfirms, 'isOpen').and.callFake(() => {
      return true;
    });
    spyOn(component.modalDebias, 'close');

    component.datasetId = '2';

    tick(1);
    fixture.detectChanges();
    expect(component.modalDebias.close).toHaveBeenCalled();
  }));

  it('should check if the debias report can be run ', fakeAsync(() => {
    fixture.detectChanges();

    expect(component.canRunDebias).toBeFalsy();
    component.checkIfCanRunDebias();
    tick(1);
    expect(component.canRunDebias).toBeFalsy();

    component.datasetId = DebiasState.READY;
    component.checkIfCanRunDebias();
    tick(1);
    expect(component.canRunDebias).toBeTruthy();
  }));

  it('should invoke checkIfCanRunDebias when the dataset id is set', fakeAsync(() => {
    spyOn(component, 'checkIfCanRunDebias');

    component.datasetId = '1';
    tick(1);
    fixture.detectChanges();

    expect(component.checkIfCanRunDebias).toHaveBeenCalled();

    component.datasetId = '2';
    tick(1);
    expect(component.checkIfCanRunDebias).toHaveBeenCalledTimes(2);
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
    component.showDatasetIssues(fakeElement);
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should show the modal for processing errors', () => {
    spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
    component.showProcessingErrors();
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should handle the debias show callback', () => {
    fixture.detectChanges();
    spyOn(component.cmpDebias, 'resetSkipArrows');
    component.onShowDebias();
    expect(component.cmpDebias.resetSkipArrows).toHaveBeenCalled();
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

  it('should show the debias report', () => {
    fixture.detectChanges();
    spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
    component.runOrShowDebiasReport(false);
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should run the debias report unless busy', fakeAsync(() => {
    expect(component.canRunDebias).toBeFalsy();

    fixture.detectChanges();

    spyOn(component.cmpDebias, 'pollDebiasReport').and.callThrough();

    component.cmpDebias.isBusy = true;
    component.runOrShowDebiasReport(true);
    tick(1);

    expect(component.cmpDebias.pollDebiasReport).not.toHaveBeenCalled();
    expect(component.canRunDebias).toBeUndefined();

    component.cmpDebias.isBusy = false;
    component.runOrShowDebiasReport(true);

    tick(1);
    expect(component.cmpDebias.pollDebiasReport).toHaveBeenCalledTimes(1);
    expect(component.cmpDebias.isBusy).toBeFalsy();
    expect(component.canRunDebias).toBeFalsy();
    expect(component.cmpDebias.pollDebiasReport).toHaveBeenCalledTimes(1);

    discardPeriodicTasks();
  }));

  it('should initiate polling in the debias component', fakeAsync(() => {
    tick(1);
    fixture.detectChanges();
    expect(component.cmpDebias).toBeTruthy();
    spyOn(component.cmpDebias, 'pollDebiasReport');

    component.runOrShowDebiasReport(true);
    expect(component.cmpDebias.pollDebiasReport).toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});
