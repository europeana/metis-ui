import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ProtocolType } from 'shared';

const formBuilder = new FormBuilder();

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
    const matches = /\w+/.exec(`${val}`);
    if (!matches || matches[0] !== val) {
      return { invalid: true };
    }
  }
  return null;
};

export const getUploadForm = (): FormGroup => {
  const form = formBuilder.group({
    name: ['', [Validators.required, validateDatasetName]],
    country: ['', [Validators.required]],
    language: ['', [Validators.required]],
    uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
    url: ['', [Validators.required]],
    stepSize: [
      '1',
      [
        (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          const parsedValue = parseInt(value);
          const isNumeric = `${parsedValue}` === value;
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
    harvestUrl: ['', [Validators.required]],
    setSpec: [''],
    metadataFormat: [''],
    sendXSLT: [false],
    xsltFile: ['']
  });
  return form;
};
