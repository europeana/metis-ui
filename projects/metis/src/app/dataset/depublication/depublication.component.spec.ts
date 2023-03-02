import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import {
  async,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import { environment } from '../../../environments/environment';
import {
  createMockPipe,
  MockDepublicationService,
  MockDepublicationServiceErrors
} from '../../_mocked';
import { of } from 'rxjs';
import { SortDirection, SortParameter } from '../../_models';
import { DepublicationService } from '../../_services';
import { DepublicationRowComponent } from './depublication-row';
import { DepublicationComponent } from '.';

describe('DepublicationComponent', () => {
  let component: DepublicationComponent;
  let fixture: ComponentFixture<DepublicationComponent>;
  let modalConfirms: ModalConfirmService;
  let depublications: DepublicationService;

  const interval = environment.intervalStatusMedium;

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
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: DepublicationService,
          useClass: errorMode ? MockDepublicationServiceErrors : MockDepublicationService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
    depublications = TestBed.inject(DepublicationService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DepublicationComponent);
    component = fixture.componentInstance;
  };

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    const frmCtrl = (val: string): FormControl<string> => {
      return ({ value: val } as unknown) as FormControl<string>;
    };

    it('should set the dataset id', () => {
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = undefined;
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = '0';
      expect(component.depublicationData.length).toBeTruthy();
    });

    it('should toggle the add menu options', () => {
      expect(component.optionsOpenAdd).toBeFalsy();
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd).toBeTruthy();
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd).toBeFalsy();
    });

    it('should toggle the depublish menu options', () => {
      expect(component.optionsOpenDepublish).toBeFalsy();
      component.toggleMenuOptionsDepublish();
      expect(component.optionsOpenDepublish).toBeTruthy();
      component.toggleMenuOptionsDepublish();
      expect(component.optionsOpenDepublish).toBeFalsy();
    });

    it('should not toggle the depublish menu if disabled', () => {
      spyOn(component, 'toggleMenuOptionsDepublish');
      component.depublicationIsTriggerable = true;
      const link = fixture.nativeElement.querySelector('.depublish > a');
      link.click();
      expect(component.toggleMenuOptionsDepublish).toHaveBeenCalledTimes(1);
      component.depublicationIsTriggerable = false;
      link.click();
      expect(component.toggleMenuOptionsDepublish).toHaveBeenCalledTimes(1);
    });

    it('should open the input dialog', () => {
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd).toBeTruthy();
      component.openDialogInput();
      expect(component.optionsOpenAdd).toBeFalsy();
    });

    it('should open the file dialog', () => {
      component.toggleMenuOptionsAdd();
      expect(component.optionsOpenAdd).toBeTruthy();
      component.openDialogFile();
      expect(component.optionsOpenAdd).toBeFalsy();
    });

    it('should close the menus', () => {
      component.optionsOpenAdd = true;
      component.optionsOpenDepublish = true;
      component.closeMenus();
      expect(component.optionsOpenAdd).toBeFalsy();
      expect(component.optionsOpenDepublish).toBeFalsy();
    });

    it('should close the menus after invoking menu commands', () => {
      component.beginPolling();
      spyOn(component, 'closeMenus').and.callThrough();
      component.onDepublishDataset();
      expect(component.closeMenus).toHaveBeenCalled();
      component.onDepublishRecordIds(true);
      expect(component.closeMenus).toHaveBeenCalledTimes(2);
      component.openDialogInput();
      expect(component.closeMenus).toHaveBeenCalledTimes(3);
      component.openDialogFile();
      expect(component.closeMenus).toHaveBeenCalledTimes(4);
      component.cleanup();
    });

    it('should submit the file', fakeAsync(() => {
      spyOn(depublications, 'setPublicationFile').and.callFake(() => {
        return of(true);
      });
      component.datasetId = '123';
      addFormFieldData();
      component.onSubmitFormFile();
      tick(1);
      expect(depublications.setPublicationFile).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should submit the text', () => {
      spyOn(depublications, 'setPublicationInfo').and.callFake(() => {
        return of(true);
      });
      const datasetId = '123';
      component.datasetId = datasetId;
      component.onSubmitRawText();
      component.formRawText.patchValue({ recordIds: `http://${datasetId}/${recordId}` });
      component.onSubmitRawText();
      expect(depublications.setPublicationInfo).toHaveBeenCalled();
    });

    it('should validate the record ids', () => {
      const datasetId = '123';
      component.datasetId = datasetId;

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

    it('should update data periodically and allow polling resets', fakeAsync(() => {
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      [1, 2, 3, 4, 5].forEach((index) => {
        expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(index);
        tick(interval);
      });
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(6);
      component.pollingRefresh.next(true);
      tick(1);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(7);
      component.cleanup();
      discardPeriodicTasks();
    }));

    it('should process check events', () => {
      const checkEvent = {
        recordId: 'X',
        deletion: true
      };
      expect(component.depublicationSelections.length).toBeFalsy();
      component.processCheckEvent(checkEvent);
      expect(component.depublicationSelections.length).toBeTruthy();
      expect(component.allSelected).toBeFalsy();

      checkEvent.deletion = false;
      component.processCheckEvent(checkEvent);
      expect(component.depublicationSelections.length).toBeFalsy();
      expect(component.allSelected).toBeFalsy();

      component.depublicationRows = ({
        length: 1,
        toArray: () => [{ record: { deletion: true }, checkboxDisabled: (): boolean => false }]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any) as QueryList<DepublicationRowComponent>;

      checkEvent.deletion = true;
      component.processCheckEvent(checkEvent);
      expect(component.allSelected).toBeTruthy();
    });

    it('should set the selection', () => {
      const spy = jasmine.createSpy();
      let valDisabled = true;
      const fnCbDisabled = (): boolean => {
        return valDisabled;
      };
      component.depublicationRows = ([
        { onChange: spy, checkboxDisabled: fnCbDisabled }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any) as QueryList<DepublicationRowComponent>;
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
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
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

      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(confirmResult);
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
        return res;
      });

      spyOn(component, 'onDepublishRecordIds').and.callThrough();

      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).not.toHaveBeenCalled();

      component.depublicationSelections = ['0'];
      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).not.toHaveBeenCalled();

      confirmResult = true;
      component.confirmDepublishRecordIds();
      expect(component.onDepublishRecordIds).toHaveBeenCalled();

      component.confirmDepublishRecordIds(true);
      expect(component.onDepublishRecordIds).toHaveBeenCalledTimes(2);
      component.cleanup();
    });

    it('should handle dataset depublication', () => {
      spyOn(depublications, 'depublishDataset').and.callThrough();
      component.beginPolling();
      component.onDepublishDataset();
      expect(depublications.depublishDataset).toHaveBeenCalled();
    });

    it('should handle record id depublication', () => {
      spyOn(depublications, 'depublishRecordIds').and.callThrough();
      component.beginPolling();
      const testSelection = ['0'];
      component.datasetId = '123';
      component.depublicationSelections = [];
      component.onDepublishRecordIds();
      expect(depublications.depublishRecordIds).not.toHaveBeenCalled();
      component.depublicationSelections = testSelection;
      component.onDepublishRecordIds();
      expect(depublications.depublishRecordIds).toHaveBeenCalledWith(
        component.datasetId,
        testSelection
      );
      component.onDepublishRecordIds(true);
      expect(depublications.depublishRecordIds).toHaveBeenCalledWith(component.datasetId, null);
    });

    it('should delete depublications', () => {
      component.beginPolling();
      component.depublicationSelections = ['xxx', 'yyy', 'zzz'];
      expect(component.depublicationSelections.length).toBeTruthy();
      component.deleteDepublications();
      expect(component.depublicationSelections.length).toBeFalsy();
    });

    it('should load the next page', () => {
      component.beginPolling();
      spyOn(component.pollingRefresh, 'next');
      expect(component.currentPage).toEqual(0);
      component.loadNextPage();
      expect(component.currentPage).toEqual(1);
      expect(component.pollingRefresh.next).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should handle errors submitting the file', fakeAsync(() => {
      spyOn(component, 'onError').and.callThrough();
      component.datasetId = '123';
      component.beginPolling();
      tick(interval);
      addFormFieldData();
      component.onSubmitFormFile();
      tick(interval);
      expect(component.onError).toHaveBeenCalled();
    }));

    it('should handle errors submitting the text', () => {
      spyOn(component, 'onError');
      const datasetId = '123';
      component.datasetId = datasetId;
      component.formRawText.patchValue({ recordIds: `http://${datasetId}/${recordId}` });
      component.onSubmitRawText();
      expect(component.onError).toHaveBeenCalled();
    });

    it('should handle dataset depublication errors', fakeAsync(() => {
      spyOn(depublications, 'depublishDataset').and.callThrough();
      spyOn(component, 'onError').and.callThrough();
      component.beginPolling();
      tick(interval);
      component.onDepublishDataset();
      tick(interval);
      expect(depublications.depublishDataset).toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalled();
      expect(component.isSaving).toBeFalsy();
    }));

    it('should handle record id depublication errors', () => {
      spyOn(depublications, 'depublishRecordIds').and.callThrough();
      spyOn(component, 'onError');
      component.beginPolling();
      component.depublicationSelections = ['0'];
      component.onDepublishRecordIds();
      expect(component.onError).toHaveBeenCalled();
    });

    it('should handle errors deleting depublications', () => {
      spyOn(component, 'onError');
      component.depublicationSelections = ['xxx', 'yyy', 'zzz'];
      expect(component.depublicationSelections.length).toBeTruthy();
      component.deleteDepublications();
      expect(component.onError).toHaveBeenCalled();
    });
  });
});
