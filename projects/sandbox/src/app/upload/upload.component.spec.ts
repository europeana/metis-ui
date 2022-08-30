import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockSandboxService, MockSandboxServiceErrors } from '../_mocked';
import { SandboxService } from '../_services';
import { UploadComponent } from './';
import { FileUploadComponent, ProtocolFieldSetComponent, ProtocolType } from 'shared';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  const testFile = new File([], 'file.zip', { type: 'zip' });

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [FileUploadComponent, ProtocolFieldSetComponent, UploadComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    component.buildForm();
    fixture.detectChanges();
  };

  const getFormValidationErrors = (form: UntypedFormGroup): string => {
    return Object.keys(form.controls)
      .map((control) => {
        const controlErrors = (form.get(control) as UntypedFormControl).errors;
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
    (component.form.get('name') as UntypedFormControl).setValue('A');
    (component.form.get('country') as UntypedFormControl).setValue('Greece');
    (component.form.get('language') as UntypedFormControl).setValue('Greek');
    (component.form.get('dataset') as UntypedFormControl).setValue(testFile);
    (component.form.get('name') as UntypedFormControl).setValue('A');
    (component.form.get('uploadProtocol') as UntypedFormControl).setValue(protocolType);

    fixture.detectChanges();

    if (protocolType === ProtocolType.OAIPMH_HARVEST) {
      (component.form.get('harvestUrl') as UntypedFormControl).setValue('http://x');
      (component.form.get('metadataFormat') as UntypedFormControl).setValue('xxx');
    } else if (protocolType === ProtocolType.HTTP_HARVEST) {
      (component.form.get('url') as UntypedFormControl).setValue('http://x');
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

    it('should validate input', () => {
      const input = component.form.get('name') as UntypedFormControl;
      expect(input.valid).toBeFalsy();
      input.setValue('A');
      expect(input.valid).toBeTruthy();
      input.setValue(' ');
      expect(input.valid).toBeFalsy();
    });

    it('should validate the dataset name', () => {
      const frmCtrl = (val: string): UntypedFormControl => {
        return ({ value: val } as unknown) as UntypedFormControl;
      };
      ['0', '1', 'A1', 'A_1', '_1_A_'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeFalsy();
      });
      [' 1', '1 ', ' 1 ', '1 1', '@', '-', '"', 'A ', 'A A'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeTruthy();
      });
    });

    it('should validate the protocol', () => {
      expect(component.protocolIsValid()).toBeFalsy();

      component.form = (undefined as unknown) as UntypedFormGroup;
      expect(component.protocolIsValid()).toBeFalsy();

      component.rebuildForm();
      fillUploadForm();
      expect(component.protocolIsValid()).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });
    beforeEach(b4Each);

    it('should validate conditionally', () => {
      component.buildForm();
      const ctrlFile = component.form.get(component.xsltFileFormName) as UntypedFormControl;
      const ctrlCB = component.form.get('sendXSLT') as UntypedFormControl;

      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();

      ctrlCB.setValue(true);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeFalsy();

      ctrlCB.setValue(false);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();

      component.form.removeControl('sendXSLT');
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
