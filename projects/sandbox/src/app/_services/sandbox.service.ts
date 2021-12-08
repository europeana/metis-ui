import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import {
  Dataset,
  FieldOption,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxService {
  constructor(private readonly http: HttpClient) {}

  /**
   * getCountries
   *
   * gets the country options
   *
   * @returns Array<FieldOption>
   **/
  getCountries(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/countries`;
    return this.http.get<Array<FieldOption>>(url);
  }

  /**
   * getLanguages
   *
   * gets the language options
   *
   * @returns Array<string>
   **/
  getLanguages(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/languages`;
    return this.http.get<Array<FieldOption>>(url);
  }

  /** requestProgress
  /*
  /* request progress info from server
  */
  requestProgress(id: string): Observable<Dataset> {
    const url = `${apiSettings.apiHost}/dataset/${id}`;
    return this.http.get<Dataset>(url);
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
    const harvestUrl = form.value.url;
    const harvestUrlOAI = form.value.harvestUrl;

    const sendUrl = harvestUrl ? harvestUrl : harvestUrlOAI ? harvestUrlOAI : '';
    const harvestType = harvestUrl
      ? 'harvestByUrl'
      : harvestUrlOAI
      ? 'harvestOaiPmh'
      : 'harvestByFile';
    const urlParameter = sendUrl.length > 0 ? '&url=' + encodeURIComponent(sendUrl) : '';
    const oaiParameters = harvestUrlOAI
      ? `&metadataformat=${form.value.metadataFormat}&setspec=${form.value.setSpec}`
      : '';
    const url = `${apiSettings.apiHost}/dataset/${form.value.name}/${harvestType}?country=${form.value.country}&language=${form.value.language}${oaiParameters}${urlParameter}`;

    const formData = new FormData();
    let fileAppended = false;

    fileNames.forEach((fileName: string) => {
      const file = (form.get(fileName) as FormControl).value;
      if (file) {
        formData.append(fileName, file);
        fileAppended = true;
      }
    });

    if (fileAppended) {
      return this.http.post<SubmissionResponseDataWrapped>(url, formData, {
        observe: 'events',
        reportProgress: true
      }) as Observable<SubmissionResponseDataWrapped>;
    } else {
      return this.http.post<SubmissionResponseData>(url, formData) as Observable<
        SubmissionResponseData
      >;
    }
  }
}
