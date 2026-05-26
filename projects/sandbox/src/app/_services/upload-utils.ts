import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { harvestValidator, ProtocolType } from 'shared';
import { HarvestType } from '../_models';

const formBuilder = new FormBuilder();

export const harvestTypeToProtocolType = (harvestType: HarvestType): ProtocolType => {
  if (harvestType === HarvestType.FILE) {
    return ProtocolType.ZIP_UPLOAD;
  } else if (harvestType === HarvestType.HTTP) {
    return ProtocolType.HTTP_HARVEST;
  } else {
    return ProtocolType.OAIPMH_HARVEST;
  }
};

/**
 * validateDatasetName
 *
 * form validator implementation for dataset name field
 *
 * @param { FormControl } control - the control to validate
 * @returns null or a code-keyed boolean
 **/
export const validateDatasetName = (control: FormControl<string>): ValidationErrors | null => {
  const val = control.value;
  if (val) {
    const matches = /\w+/.exec(`${val}`); // NOSONAR
    if (!matches || matches[0] !== val) {
      return { invalid: true };
    }
  }
  return null;
};

export const getNameSuggestion = (originalName: string): string => {
  const matches = /(.*)_(\d+$)/.exec(originalName); // NOSONAR
  if (!matches || matches.length !== 3) {
    return `${originalName}_1`;
  }
  const bumped = Number.parseInt(matches[2]) + 1;
  return `${matches[1]}_${bumped}`;
};

export const getUploadForm = (): FormGroup => {
  const form = formBuilder.group({
    name: ['', [Validators.required, validateDatasetName]],
    country: ['', [Validators.required]],
    language: ['', [Validators.required]],
    uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
    url: ['', [Validators.required, harvestValidator]],
    stepSize: [
      '1',
      [
        // Changed (control: AbstractControl) to typed control parameter to prevent syntax collisions
        (control: any): ValidationErrors | null => {
          const value = control.value;
          const parsedValue = Number.parseInt(value);
          const isNumeric = `${parsedValue}` === `${value}`;
          if (value) {
            if (!isNumeric) {
              return { nonNumeric: true };
            } else if (parsedValue < 1) {
              return { min: true };
            }
          } else {
            return { required: true };
          }
          return null;
        }
      ]
    ],
    // FIXED TS1005: Cleaned up double type casting syntax
    dataset: [(undefined as any) as File, [Validators.required]],
    harvestUrl: ['', [Validators.required, harvestValidator]],
    setSpec: [''],
    metadataFormat: [''],
    sendXSLT: [false],
    xsltFile: ['']
  });
  return form;
};

/*
export const getUploadForm = (): FormGroup => {
  const form = formBuilder.group({
    name: ['', [Validators.required, validateDatasetName]],
    country: ['', [Validators.required]],
    language: ['', [Validators.required]],
    uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
    url: ['', [Validators.required, harvestValidator]],
    stepSize: [
      '1',
      [
        (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          const parsedValue = Number.parseInt(value);
          const isNumeric = `${parsedValue}` === `${value}`;
          if (value) {
            if (!isNumeric) {
              return { nonNumeric: true };
            } else if (parsedValue < 1) {
              return { min: true };
            }
          } else {
            return { required: true };
          }
          return null;
        }
      ]
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataset: [(undefined as any) as File, [Validators.required]],
    harvestUrl: ['', [Validators.required, harvestValidator]],
    setSpec: [''],
    metadataFormat: [''],
    sendXSLT: [false],
    xsltFile: ['']
  });
  return form;
};
*/
