import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { mockDataset } from '../_mocked';
import { DatasetInfoComponent } from '.';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [{ provide: ModalConfirmService, useClass: MockModalConfirmService }],
      declarations: [DatasetInfoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetInfoComponent);
    component = fixture.componentInstance;
    component.datasetInfo = mockDataset['dataset-info'];
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
});
