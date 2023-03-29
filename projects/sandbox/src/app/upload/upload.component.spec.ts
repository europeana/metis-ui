import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MockSandboxService, MockSandboxServiceErrors } from '../_mocked';
import { SandboxService } from '../_services';
import { UploadComponent } from './';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  CheckboxComponent,
  FileUploadComponent,
  MockModalConfirmService,
  ModalConfirmService,
  ProtocolFieldSetComponent,
  ProtocolType,
  RadioButtonComponent
} from 'shared';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let modalConfirms: ModalConfirmService;

  const testFile = new File([], 'file.zip', { type: 'zip' });

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [
        CheckboxComponent,
        FileUploadComponent,
        ProtocolFieldSetComponent,
        RadioButtonComponent,
        UploadComponent
      ],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        },
        { provide: ModalConfirmService, useClass: MockModalConfirmService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const getFormValidationErrors = (form: FormGroup): string => {
    return Object.keys(form.controls)
      .map((control) => {
        const controlErrors = (form.get(control) as FormControl).errors;
        if (!controlErrors) {
          return [];
        }
        const controlErrorsString = Object.keys(controlErrors)
          .map((keyError: string) => `${keyError}: ${controlErrors[keyError]}`)
          .join(', ');
        return `${control}: {${controlErrorsString}}`;
      })
      .filter((list) => list.length > 0)
      .join('\n');
  };

  const fillUploadForm = (protocolType = ProtocolType.HTTP_HARVEST): void => {
    component.form.controls.name.setValue('A');
    component.form.controls.country.setValue('Greece');
    component.form.controls.language.setValue('Greek');
    component.form.controls.dataset.setValue(testFile);
    component.form.controls.name.setValue('A');
    component.form.controls.uploadProtocol.setValue(protocolType);

    fixture.detectChanges();

    if (protocolType === ProtocolType.OAIPMH_HARVEST) {
      component.form.controls.harvestUrl.setValue('http://x');
      component.form.controls.metadataFormat.setValue('xxx');
    } else if (protocolType === ProtocolType.HTTP_HARVEST) {
      component.form.controls.url.setValue('http://x');
    }
    expect(getFormValidationErrors(component.form)).toEqual('');
    expect(component.form.valid).toBeTruthy();
  };

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the countries and languages', () => {
      expect(component.countryList).toBeTruthy();
      expect(component.languageList).toBeTruthy();
    });

    it('should show the information modal', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(true);
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
        return res;
      });

      component.showStepSizeInfo();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should validate input', () => {
      const input = component.form.controls.name;
      expect(input.valid).toBeFalsy();
      input.setValue('A');
      expect(input.valid).toBeTruthy();
      input.setValue(' ');
      expect(input.valid).toBeFalsy();
    });

    it('should validate the dataset name', () => {
      const frmCtrl = (val: string): FormControl => {
        return ({ value: val } as unknown) as FormControl;
      };
      ['0', '1', 'A1', 'A_1', '_1_A_'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeFalsy();
      });
      [' 1', '1 ', ' 1 ', '1 1', '@', '-', '"', 'A ', 'A A'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeTruthy();
      });
    });

    it('should validate the protocol', () => {
      fillUploadForm();
      expect(component.protocolIsValid()).toBeTruthy();
      component.form.controls.uploadProtocol.setValue(ProtocolType.HTTP_HARVEST);
      component.form.controls.url.setValue('');
      expect(component.protocolIsValid()).toBeFalsy();
      component.form = (null as unknown) as FormGroup;
      expect(component.protocolIsValid()).toBeFalsy();
    });

    it('should validate the stepSize input', () => {
      const input = component.form.controls.stepSize;
      expect(input.valid).toBeTruthy();
      input.setValue('-1');
      expect(input.valid).toBeFalsy();
      input.setValue(' ');
      expect(input.valid).toBeFalsy();
      input.setValue('abc');
      expect(input.valid).toBeFalsy();
      input.setValue('');
      expect(input.valid).toBeFalsy();
      input.setValue('1');
      expect(input.valid).toBeTruthy();
    });

    it('should disable the form on submit', () => {
      fillUploadForm();
      expect(component.form.enabled).toBeTruthy();
      expect(component.form.valid).toBeTruthy();

      component.form.controls.url.setValue('http://wrap.it');
      component.onSubmitDataset();
      expect(component.form.enabled).toBeFalsy();
      expect(component.form.valid).toBeFalsy();

      component.form.enable();
      component.rebuildForm();

      fillUploadForm(ProtocolType.OAIPMH_HARVEST);
      expect(component.form.enabled).toBeTruthy();
      expect(component.form.valid).toBeTruthy();
      component.onSubmitDataset();
      expect(component.form.enabled).toBeFalsy();
      expect(component.form.valid).toBeFalsy();

      component.form.enable();
      component.rebuildForm();

      fillUploadForm(ProtocolType.OAIPMH_HARVEST);
      component.onSubmitDataset();
      expect(component.form.enabled).toBeFalsy();
      expect(component.form.valid).toBeFalsy();
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });
    beforeEach(b4Each);

    it('should validate conditionally', () => {
      const ctrlFile = component.form.controls.xsltFile;
      const ctrlCB = component.form.controls.sendXSLT;

      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();

      ctrlCB.setValue(true);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeFalsy();

      ctrlCB.setValue(false);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();
    });

    it('should handle upload form errors', fakeAsync(() => {
      expect(component.error).toBeFalsy();
      component.onSubmitDataset();
      tick(1);
      expect(component.error).toBeFalsy();

      fillUploadForm();
      expect(component.error).toBeFalsy();
      component.onSubmitDataset();
      tick(1);
      expect(component.error).toBeTruthy();
      component.cleanup();
      tick(1);
    }));
  });
});
