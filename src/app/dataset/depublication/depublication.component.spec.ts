import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  createMockPipe,
  MockDepublicationService,
  MockDepublicationServiceErrors,
  MockErrorService
} from '../../_mocked';

import { SortDirection } from '../../_models';
import { DepublicationService, ErrorService } from '../../_services';
import { DepublicationComponent } from '.';

describe('DepublicationComponent', () => {
  let component: DepublicationComponent;
  let fixture: ComponentFixture<DepublicationComponent>;
  let depublications: DepublicationService;
  let errors: ErrorService;

  const interval = 5000;
  const formBuilder: FormBuilder = new FormBuilder();
  const recordId = 'BibliographicResource_1000126221328';

  const addFormFieldData = (): void => {
    component.formFile.patchValue({ depublicationFile: { name: 'foo', size: 500001 } as File });
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        DepublicationComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        {
          provide: DepublicationService,
          useClass: errorMode ? MockDepublicationServiceErrors : MockDepublicationService
        },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: FormBuilder, useValue: formBuilder }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    depublications = TestBed.get(DepublicationService);
    errors = TestBed.get(ErrorService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DepublicationComponent);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    if (component.depublicationSubscription) {
      component.depublicationSubscription.unsubscribe();
    }
  });

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    const frmCtrl = (val: string, fileInput?: boolean): FormControl => {
      return ({ value: fileInput ? { name: val } : val } as unknown) as FormControl;
    };

    it('should set the dataset id', () => {
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = undefined;
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = '0';
      expect(component.depublicationData.length).toBeTruthy();
      // invoke the getter
      expect(component.datasetId).toEqual('0');
    });

    it('should toggle the menu options', () => {
      expect(component.optionsOpen).toBeFalsy();
      component.toggleMenuOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.toggleMenuOptions();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should open the input dialog', () => {
      component.toggleMenuOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.openDialogInput();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should open the file dialog', () => {
      component.toggleMenuOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.openDialogFile();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should close the dialogs', () => {
      component.dialogInputOpen = true;
      component.dialogFileOpen = true;
      component.closeDialogs();
      expect(component.dialogInputOpen).toBeFalsy();
      expect(component.dialogFileOpen).toBeFalsy();
    });

    it('should submit the file', () => {
      component.dialogFileOpen = true;
      component.datasetId = '123';
      component.onSubmitFormFile();
      expect(component.dialogFileOpen).toBeTruthy();
      component.formFile.patchValue({ depublicationFile: { name: 'foo', size: 500001 } as File });
      component.onSubmitFormFile();
      expect(component.dialogFileOpen).toBeFalsy();
    });

    it('should submit the text', () => {
      const datasetId = '123';
      component.datasetId = datasetId;
      component.dialogInputOpen = true;

      component.onSubmitRawText();
      expect(component.dialogInputOpen).toBeTruthy();
      component.formRawText.patchValue({ recordIds: `http://${datasetId}/${recordId}` });
      component.onSubmitRawText();
      expect(component.dialogInputOpen).toBeFalsy();
    });

    it('should validate the record ids', () => {
      const datasetId = '123';
      component.datasetId = datasetId;

      let falsyVals = [
        recordId,
        `${datasetId}/${recordId}`,
        `/${datasetId}/${recordId}`,
        `path/${datasetId}/${recordId}`,
        `path/path/${datasetId}/${recordId}`,
        `http://${datasetId}/${recordId}`,
        `https://path/${datasetId}/${recordId}`,
        `http://www.server.com/path1/path2/${datasetId}/${recordId}`,
        `
          https://path/${datasetId}/${recordId}
          https://path/${datasetId}/${recordId}
        `
      ];

      let truthyVals = [
        `${recordId}/${datasetId}`,
        `//${datasetId}/${recordId}`,
        `htps://path/${datasetId}/${recordId}`,
        `http://path/${datasetId}/${recordId}/`,
        `http://path/${datasetId} ${recordId}`,
        `/${datasetId}/notTheDataset/${recordId}`,
        `/${datasetId + 1}/${recordId}`,
        `
          https://path/${datasetId}/${recordId}/
          https://path/${datasetId}/${recordId}
        `,
        'https://path/INVALID${datasetId}/${recordId}'
      ];

      falsyVals.forEach((falsy: string) => {
        console.log(`test falsy val: ${falsy}`);
        expect(component.validateRecordIds(frmCtrl(falsy))).toBeFalsy();
      });

      truthyVals.forEach((truthy: string) => {
        console.log(`test truthy val: ${truthy}`);
        expect(component.validateRecordIds(frmCtrl(truthy))).toBeTruthy();
      });
    });

    it('should validate for no whitespace', () => {
      expect(component.validateWhitespace(frmCtrl('hello'))).toBeFalsy();
      expect(component.validateWhitespace(frmCtrl(' '))).toBeTruthy();
    });

    it('should validate the file extension', () => {
      expect(component.validateFileExtension(frmCtrl('file.txt', true))).toBeFalsy();
      expect(component.validateFileExtension(frmCtrl('file.png', true))).toBeTruthy();
    });

    it('should set the sort parameter', () => {
      const sortParam = { field: 'id', direction: SortDirection.ASC };
      const sortParamNoDir = { field: 'id', direction: SortDirection.UNSET };
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(1);
      component.setDataSortParameter(sortParam);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(2);
      expect(component.dataSortParam).toEqual(sortParam);
      component.setDataSortParameter(sortParamNoDir);
      expect(component.dataSortParam).toBeFalsy();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(3);
    });

    it('should set the filter parameter', () => {
      const filterParam = 'xxx';
      const filterParamEmpty = '';
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(1);
      component.setDataFilterParameter(filterParam);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(2);
      expect(component.dataFilterParam).toEqual(filterParam);
      component.setDataFilterParameter(filterParamEmpty);
      expect(component.dataSortParam).toBeFalsy();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(3);
    });

    it('should clean up', () => {
      component.beginPolling();
      spyOn(component.depublicationSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.depublicationSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should update data periodically and allow polling resets', fakeAsync(() => {
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      //component.loadData();

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(index);
        tick(interval);
      });

      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(6);
      component.pollingRefresh.next(true);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(7);

      component.depublicationSubscription.unsubscribe();
      tick(interval);
    }));
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should handle load errors', () => {
      expect(component).toBeTruthy();
      spyOn(errors, 'handleError');
      component.beginPolling();
      expect(errors.handleError).toHaveBeenCalled();
    });

    it('should not submit the file', () => {
      component.dialogFileOpen = true;

      component.datasetId = '123';
      addFormFieldData();

      expect(component.dialogFileOpen).toBeTruthy();
      component.onSubmitFormFile();
      expect(component.dialogFileOpen).toBeTruthy();
    });
  });
});
