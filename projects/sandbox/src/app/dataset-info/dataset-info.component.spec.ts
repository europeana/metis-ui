import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { mockDatasetInfo, MockSandboxService } from '../_mocked';
import { SandboxService } from '../_services';
import { DatasetInfoComponent } from '.';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;
  let sandbox: SandboxService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: MockSandboxService
        }
      ],
      declarations: [DatasetInfoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
    sandbox = TestBed.inject(SandboxService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetInfoComponent);
    component = fixture.componentInstance;
    component.datasetInfo = mockDatasetInfo;
  };

  const getConfirmResult = (): Observable<boolean> => {
    const res = of(true);
    modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
    return res;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the modal for incomplete data', () => {
    spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
    component.showIncompleteDataWarning();
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

  it('should load data when the datasetId is set', () => {
    spyOn(sandbox, 'requestDatasetInfo').and.callThrough();
    component.datasetId = '1';
    expect(sandbox.requestDatasetInfo).toHaveBeenCalled();
  });
});
