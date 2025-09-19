import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Observable } from 'rxjs';

import { ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';
import { validateDatasetName } from './';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  /**
  /* getCountries
  /*  gets the country options
  /*  @returns Observable<Array<FieldOption>>
  **/
  getCountries(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/countries`;
    return this.http.get<Array<FieldOption>>(url);
  }

  /**
  /*  getLanguages
  /*  gets the language options
  /*  @returns Observable<Array<FieldOption>>
  **/
  getLanguages(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/languages`;
    return this.http.get<Array<FieldOption>>(url);
  }

  getUploadForm(): FormGroup {
    const form = this.formBuilder.group({
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
  }

  /** submitDataset
  /*  attach file data to form and post
  /*  @param {FormGroup} form - the user-filled data
  /*  @param {Array<string>} fileNames - the names of files to append
  */
  submitDataset(
    form: FormGroup,
    fileNames: Array<string>
  ): Observable<SubmissionResponseData | SubmissionResponseDataWrapped> {
    const protocol = form.value.uploadProtocol;
    let sendUrl = '';
    let harvestType = 'harvestByFile';
    let oaiParameters = '';

    if (protocol === ProtocolType.HTTP_HARVEST) {
      sendUrl = form.value.url;
      harvestType = 'harvestByUrl';
    } else if (protocol === ProtocolType.OAIPMH_HARVEST) {
      sendUrl = form.value.harvestUrl;
      harvestType = 'harvestOaiPmh';
      oaiParameters = `&metadataformat=${form.value.metadataFormat}&setspec=${form.value.setSpec}`;
    }

    const urlParameter = sendUrl.length > 0 ? '&url=' + encodeURIComponent(sendUrl) : '';

    let url = `${apiSettings.apiHost}/dataset/${form.value.name}/${harvestType}`;
    url += `?country=${form.value.country}&language=${form.value.language}`;
    url += `&stepsize=${form.value.stepSize}`;
    url += `${oaiParameters}${urlParameter}`;

    const formData = new FormData();
    let fileAppended = false;

    fileNames.forEach((fileName: string) => {
      const file = form.get(fileName) as FormControl;
      if (file) {
        formData.append(fileName, file.value);
        fileAppended = true;
      }
    });

    if (fileAppended) {
      return this.http.post<SubmissionResponseDataWrapped>(url, formData);
    } else {
      return this.http.post<SubmissionResponseData>(url, formData);
    }
  }
}
