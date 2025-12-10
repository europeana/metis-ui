import { FormGroup } from '@angular/forms';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';

export const mockCountries = [
  {
    name: 'Greece',
    xmlValue: 'GREECE'
  },
  {
    name: 'Hungary',
    xmlValue: 'HUNGARY'
  },
  {
    name: 'Italy',
    xmlValue: 'ITALY'
  }
];

export const mockLanguages = [
  {
    name: 'Greek',
    xmlValue: 'Greek'
  },
  {
    name: 'Hungarian',
    xmlValue: 'Hungarian'
  },
  {
    name: 'Italian',
    xmlValue: 'Italian'
  }
];

export class MockUploadService {
  errorMode = false;

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      })
    );
  }

  /**
   * getCountries
   * gets the country options
   * @returns Array<string>
   **/
  getCountries(): Observable<Array<FieldOption>> {
    return of(mockCountries);
  }

  /**
   * getLanguages
   * gets the language options
   * @returns Array<string>
   **/
  getLanguages(): Observable<Array<FieldOption>> {
    return of(mockLanguages);
  }

  submitDataset(
    form: FormGroup,
    fileNames: Array<string>
  ): Observable<SubmissionResponseData | SubmissionResponseDataWrapped> {
    console.log(
      `mock submitDataset(${form.value.name}, ${form.value.country}, ${form.value.language}, ${form.value.url}, ${fileNames})`
    );
    if (this.errorMode) {
      return this.getError('mock submitDataset throws error');
    }
    if (form.value.url && form.value.url.indexOf('wrap') > -1) {
      return of({
        body: {
          'dataset-id': '1',
          'records-to-process': 1,
          'duplicate-records': 0
        }
      }).pipe(delay(1));
    }
    return of({
      'dataset-id': '1',
      'records-to-process': 1,
      'duplicate-records': 0
    }).pipe(delay(1));
  }
}

export class MockUploadServiceErrors extends MockUploadService {
  errorMode = true;
}
