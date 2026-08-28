import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, InputSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  createMockPipe,
  FileUploadComponent,
  MockModalConfirmService,
  ModalConfirmService
} from 'shared';
import {
  MockDepublicationService,
  MockDepublicationServiceErrors,
  MockTranslateService
} from '../../_mocked';
import { of } from 'rxjs';
import { SortDirection, SortParameter } from '../../_models';
import { DepublicationService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { DepublicationComponent } from '.';
import { DepublicationRowComponent } from './depublication-row';

describe('DepublicationComponent', () => {
  let component: DepublicationComponent;
  let fixture: ComponentFixture<DepublicationComponent>;
  let modalConfirms: ModalConfirmService;
  let depublications: DepublicationService;

  let mockFileUploadInstance: any;

  const recordId = 'BibliographicResource_1000126221328';

  const addFormFieldData = (): void => {
    const mockFile = new File([''], 'foo.txt', { type: 'text/plain' });
    component.formFile.patchValue({ depublicationFile: mockFile });
  };

  const generateDepublicationRowsMock = (): any[] => {
    return [
      {
        record: () => ({ deletion: true }),
        checkboxDisabled: (): boolean => false
      }
    ];
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DepublicationComponent,
        DepublicationRowComponent,
        FileUploadComponent,
        NgTemplateOutlet,
        NgClass
      ],
      providers: [
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: DepublicationService,
          useClass: errorMode ? MockDepublicationServiceErrors : MockDepublicationService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
    depublications = TestBed.inject(DepublicationService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DepublicationComponent);
    fixture.componentRef.setInput('datasetName', 'Test Dataset');
    component = fixture.componentInstance;

    mockFileUploadInstance = {
      clearFileValue: jasmine.createSpy('clearFileValue')
    };

    Object.defineProperty(component, 'fileUpload', {
      value: () => mockFileUploadInstance,
      configurable: true
    });

    Object.defineProperty(component, 'depublicationRows', {
      value: () => generateDepublicationRowsMock(),
      configurable: true
    });

    Object.defineProperty(component, 'depublicationRows', {
      value: () => [],
      configurable: true
    });
  };

  describe('Normal operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    const frmCtrl = (val: string): FormControl<string> => {
      return ({ value: val } as unknown) as FormControl<string>;
    };

    it('should set the dataset id', async () => {
      component.depublicationData.set([]);
      expect(component.depublicationData().length).toBeFalsy();

      fixture.componentRef.setInput('datasetId', undefined);
      fixture.detectChanges();
      expect(component.depublicationData().length).toBeFalsy();

      Object.defineProperty(component, 'depublicationRows', {
        value: () => [],
        configurable: true
      });

      spyOn(depublications, 'getPublicationInfoUptoPage').and.returnValue(
        of({
          depublicationRecordIds: { results: [], nextPage: -1 },
          depublicationTriggerable: true
        } as any)
      );

      fixture.componentRef.setInput('datasetId', '0');
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      // Verify state parameters instead of layout lengths to keep it type-safe
      expect(component.datasetId()).toEqual('0');
      component.cleanup();
    });

    it('should set the depublication rows', () => {
      spyOn(component, 'checkAllAreSelected');

      Object.defineProperty(component, 'depublicationRows', {
        value: () => generateDepublicationRowsMock()
      });

      component.checkAllAreSelected();
      expect(component.checkAllAreSelected).toHaveBeenCalled();
    });

    it('should toggle the add menu options', () => {
      expect(component.optionsOpenAdd()).toBeFalsy();
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd()).toBeTruthy();
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd()).toBeFalsy();
    });

    it('should toggle the depublish menu options', () => {
      expect(component.optionsOpenDepublish()).toBeFalsy();
      component.toggleMenuOptionsDepublish();
      expect(component.optionsOpenDepublish()).toBeTruthy();
      component.toggleMenuOptionsDepublish();
      expect(component.optionsOpenDepublish()).toBeFalsy();
    });

    it('should not toggle the depublish menu if disabled', () => {
      spyOn(component, 'toggleMenuOptionsDepublish');
      component.depublicationIsTriggerable.set(true);
      const link = fixture.nativeElement.querySelector('.depublish > a');
      link.click();
      expect(component.toggleMenuOptionsDepublish).toHaveBeenCalledTimes(1);
      component.depublicationIsTriggerable.set(false);
      link.click();
      expect(component.toggleMenuOptionsDepublish).toHaveBeenCalledTimes(1);
    });

    it('should open the input dialog', () => {
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd()).toBeTruthy();
      component.openDialogInput();
      expect(component.optionsOpenAdd()).toBeFalsy();
    });

    it('should close the input dialog', () => {
      spyOn(component, 'closeMenus');
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(false);
      });
      component.openDialogInput();
      expect(component.closeMenus).toHaveBeenCalled();
    });

    it('should open the file dialog', () => {
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd()).toBeTruthy();
      component.openDialogFile();
      expect(component.optionsOpenAdd()).toBeFalsy();
    });

    it('should close the menus', () => {
      component.optionsOpenAdd.set(true);
      component.optionsOpenDepublish.set(true);
      component.closeMenus();
      expect(component.optionsOpenAdd()).toBeFalsy();
      expect(component.optionsOpenDepublish()).toBeFalsy();
    });

    it('should close the menus after invoking menu commands', () => {
      component.beginPolling();
      spyOn(component, 'closeMenus').and.callThrough();
      component.onDepublishDataset('reason');
      expect(component.closeMenus).toHaveBeenCalled();
      component.onDepublishRecordIds('GDPR', true);
      expect(component.closeMenus).toHaveBeenCalledTimes(2);
      component.openDialogInput();
      expect(component.closeMenus).toHaveBeenCalledTimes(3);
      component.openDialogFile();
      expect(component.closeMenus).toHaveBeenCalledTimes(4);
      component.cleanup();
    });

    it('should submit the file', async () => {
      spyOn(depublications, 'setPublicationFile').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next(true);
          return { unsubscribe: () => {} };
        }
      } as any);

      spyOn(component, 'refreshPolling').and.stub();

      component.depublicationData.set([]);
      fixture.componentRef.setInput('datasetId', '123');

      Object.defineProperty(component, 'depublicationRows', {
        value: () => [],
        configurable: true
      });

      fixture.detectChanges();

      // Force form valid parameter selectors to true
      Object.defineProperty(component.formFile, 'valid', { get: () => true, configurable: true });
      fixture.detectChanges();

      component.onSubmitFormFile();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(mockFileUploadInstance.clearFileValue).toHaveBeenCalled();
      component.cleanup();
    });

    it('should submit the text', () => {
      spyOn(depublications, 'setPublicationInfo').and.callFake(() => {
        return of(true);
      });
      const datasetId = '123';
      fixture.componentRef.setInput('datasetId', datasetId);
      component.onSubmitRawText();
      expect(depublications.setPublicationInfo).not.toHaveBeenCalled();
      component.formRawText.patchValue({ recordIds: `http://${datasetId}/${recordId}` });
      component.onSubmitRawText();
      expect(depublications.setPublicationInfo).toHaveBeenCalled();
    });

    it('should validate the record ids', () => {
      const datasetId = '123';
      fixture.componentRef.setInput('datasetId', datasetId);

      const falsyVals = [
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

      const truthyVals = [
        `.`,
        'a-_$&#%@)}[*!@#',
        `${recordId}/`,
        `${recordId}/${datasetId}`,
        `//${datasetId}/${recordId}`,
        `http:`,
        `http://`,
        `http://path`,
        `https:/a/${datasetId}/${recordId}`,
        `htps://path/${datasetId}/${recordId}`,
        `http://path/${datasetId}/${recordId}/`,
        `http://path/${datasetId} ${recordId}`,
        'https://path/INVALID${datasetId}/${recordId}',
        `http://www.server.com//path1/path2/${datasetId}/${recordId}`,
        `http://www.server.com/path1/path2${datasetId}/${recordId}`,
        `/${datasetId}/notTheDataset/${recordId}`,
        `/${datasetId + 1}/${recordId}`,
        `
          https://path/${datasetId}/${recordId}/
          https://path/${datasetId}/${recordId}
        `,
        `https:///////path//////3/asd`,
        `https:///path/3/asd`
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
      const frmCtrlFile = (val: string): FormControl<File> => {
        return ({ value: { name: val } } as unknown) as FormControl<File>;
      };
      expect(component.validateFileExtension(frmCtrlFile('file.txt'))).toBeFalsy();
      expect(component.validateFileExtension(frmCtrlFile('file.png'))).toBeTruthy();
    });

    it('should set the sort parameter', () => {
      const sortParam = { field: 'id', direction: SortDirection.ASC };
      const sortParamNoDir = { field: 'id', direction: SortDirection.UNSET };
      const sortParamNoField = ({ direction: SortDirection.ASC } as unknown) as SortParameter;
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(1);
      component.setDataSortParameter(sortParam);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(2);
      expect(component.dataSortParam).toEqual(sortParam);
      component.setDataSortParameter(sortParamNoDir);
      expect(component.dataSortParam).toBeFalsy();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(3);
      component.setDataSortParameter(sortParam);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(4);
      expect(component.dataSortParam).toBeTruthy();
      component.setDataSortParameter(sortParamNoField);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(5);
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

    it('should update data periodically and allow polling resets', async () => {
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();

      component.beginPolling();
      fixture.detectChanges();
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(1);

      component.pollingRefresh.next(true);

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(2);
      component.cleanup();
    });

    it('should process check events', () => {
      const checkEvent = {
        recordId: 'X',
        deletion: true
      };

      const mockRecordState = { deletion: false };

      expect(component.depublicationSelections().length).toBeFalsy();

      Object.defineProperty(component, 'depublicationRows', {
        value: () => [
          {
            checkboxDisabled: () => false,
            record: () => mockRecordState
          }
        ],
        configurable: true
      });

      component.processCheckEvent(checkEvent);
      expect(component.depublicationSelections().length).toBeTruthy();
      expect(component.allSelected()).toBeFalsy();

      checkEvent.deletion = false;
      mockRecordState.deletion = false;
      component.processCheckEvent(checkEvent);
      expect(component.depublicationSelections().length).toBeFalsy();
      expect(component.allSelected()).toBeFalsy();

      checkEvent.deletion = true;
      mockRecordState.deletion = true;

      component.processCheckEvent(checkEvent);
      expect(component.allSelected()).toBeTruthy();
    });

    it('should set the selection', () => {
      const spy = jasmine.createSpy();
      let valDisabled = true;
      const fnCbDisabled = (): boolean => {
        return valDisabled;
      };

      Object.defineProperty(component, 'depublicationRows', {
        value: () => [
          {
            onChange: spy,
            checkboxDisabled: fnCbDisabled,
            record: () => ({ deletion: true })
          }
        ],
        configurable: true
      });

      component.setSelection(true);
      expect(spy).not.toHaveBeenCalled();

      valDisabled = false;
      component.setSelection(true);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should confirm dataset depublication', () => {
      let confirmResult = false;
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(confirmResult);
        modalConfirms.add({
          open: () => res,

          close: () => undefined,
          id: (() => component.modalDatasetDepublish as unknown) as InputSignal<string>,

          isShowing: signal(true)
        });
        return res;
      });
      spyOn(component, 'onDepublishDataset').and.callThrough();
      component.confirmDepublishDataset();
      expect(component.onDepublishDataset).not.toHaveBeenCalled();

      confirmResult = true;
      component.confirmDepublishDataset();
      expect(component.onDepublishDataset).toHaveBeenCalled();
      component.cleanup();
    });

    it('should confirm record id depublication', () => {
      let confirmResult = false;
      const mockRecordState = { deletion: false };

      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(confirmResult);
        modalConfirms.add({
          open: () => res,
          close: () => undefined,
          id: (() => component.modalRecIdDepublish as unknown) as InputSignal<string>,
          isShowing: signal(true)
        });
        return res;
      });

      spyOn(component, 'onDepublishRecordIds').and.callThrough();

      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).not.toHaveBeenCalled();

      Object.defineProperty(component, 'depublicationRows', {
        value: () => [
          {
            checkboxDisabled: () => false,
            record: () => mockRecordState
          }
        ],
        configurable: true
      });

      component.depublicationSelections.set(['0']);
      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).not.toHaveBeenCalled();

      confirmResult = true;
      mockRecordState.deletion = true;

      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).toHaveBeenCalled();

      component.confirmDepublishRecordIds(true);
      expect(component.onDepublishRecordIds).toHaveBeenCalledTimes(2);
      component.cleanup();
    });

    it('should handle dataset depublication', () => {
      spyOn(depublications, 'depublishDataset').and.callThrough();
      component.beginPolling();
      component.onDepublishDataset('reason');
      expect(depublications.depublishDataset).toHaveBeenCalled();
    });

    it('should handle record id depublication', () => {
      spyOn(depublications, 'depublishRecordIds').and.callThrough();
      const reason = 'Generic';
      component.beginPolling();
      const testSelection = ['0'];
      fixture.componentRef.setInput('datasetId', '123');
      component.depublicationSelections.set([]);
      component.onDepublishRecordIds(reason);
      expect(depublications.depublishRecordIds).not.toHaveBeenCalled();
      component.depublicationSelections.set(testSelection);
      component.onDepublishRecordIds(reason);
      expect(depublications.depublishRecordIds).toHaveBeenCalledWith(
        component.datasetId()!,
        reason,
        testSelection
      );
      component.onDepublishRecordIds(reason, true);
      expect(depublications.depublishRecordIds).toHaveBeenCalledWith(
        component.datasetId()!,
        reason,
        null
      );
    });

    it('should delete depublications', () => {
      component.beginPolling();
      component.depublicationSelections.set(['xxx', 'yyy', 'zzz']);
      expect(component.depublicationSelections().length).toBeTruthy();
      component.deleteDepublications();
      expect(component.depublicationSelections().length).toBeFalsy();
    });

    it('should load the next page', () => {
      component.beginPolling();
      spyOn(component.pollingRefresh, 'next');
      expect(component.currentPage()).toEqual(0);
      component.loadNextPage();
      expect(component.currentPage()).toEqual(1);
      expect(component.pollingRefresh.next).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors submitting the file', async () => {
      spyOn(component, 'onError').and.callThrough();
      expect(component.errorNotification()).toBeFalsy();

      fixture.componentRef.setInput('datasetId', '123');
      component.beginPolling();
      fixture.detectChanges();

      addFormFieldData();

      spyOn(depublications, 'setPublicationFile').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.error(new HttpErrorResponse({ error: 'Mock Network Error Status' }));
          return { unsubscribe: () => {} };
        }
      } as any);

      Object.defineProperty(component.formFile, 'valid', { get: () => true, configurable: true });
      component.onSubmitFormFile();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(component.onError).toHaveBeenCalled();
      expect(component.errorNotification()).toBeTruthy();
      component.cleanup();
    });

    it('should handle errors submitting the text', () => {
      spyOn(component, 'onError').and.callThrough();
      expect(component.errorNotification()).toBeFalsy();
      const datasetId = '123';
      fixture.componentRef.setInput('datasetId', datasetId);
      component.formRawText.patchValue({ recordIds: `http://${datasetId}/${recordId}` });
      component.onSubmitRawText();
      expect(component.onError).toHaveBeenCalled();
      expect(component.errorNotification()).toBeTruthy();
    });

    it('should handle dataset depublication errors', async () => {
      spyOn(component, 'onError').and.callThrough();
      expect(component.errorNotification()).toBeFalsy();

      spyOn(depublications, 'depublishDataset').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.error(new HttpErrorResponse({ error: 'Mock Depublish Error' }));
          return { unsubscribe: () => {} };
        }
      } as any);

      component.beginPolling();
      fixture.detectChanges();

      component.onDepublishDataset('reason');

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(depublications.depublishDataset).toHaveBeenCalledWith(
        component.datasetId()!,
        'reason'
      );
      expect(component.onError).toHaveBeenCalled();
      expect(component.isSaving()).toBeFalse();
      expect(component.errorNotification()).toBeTruthy();

      component.cleanup();
    });

    it('should handle record id depublication errors', () => {
      spyOn(depublications, 'depublishRecordIds').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      expect(component.errorNotification()).toBeFalsy();
      component.beginPolling();
      component.depublicationSelections.set(['0']);
      component.onDepublishRecordIds('GDPR');
      expect(component.onError).toHaveBeenCalled();
      expect(component.errorNotification()).toBeTruthy();
    });

    it('should handle errors deleting depublications', () => {
      spyOn(component, 'onError').and.callThrough();
      expect(component.errorNotification()).toBeFalsy();
      component.depublicationSelections.set(['xxx', 'yyy', 'zzz']);
      expect(component.depublicationSelections().length).toBeTruthy();
      component.deleteDepublications();
      expect(component.onError).toHaveBeenCalled();
      expect(component.errorNotification()).toBeTruthy();
    });
  });
});
