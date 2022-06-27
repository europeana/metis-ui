import { FormGroup } from '@angular/forms';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import {
  mockDataset,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockRecordReport
} from '.';
import {
  Dataset,
  DatasetStatus,
  FieldOption,
  ProblemPattern,
  ProblemPatternsDataset,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';

export const mockCountries = [
  {
    name: 'Greece',
    xmlValue: 'Greece'
  },
  {
    name: 'Hungary',
    xmlValue: 'Hungary'
  },
  {
    name: 'Italy',
    xmlValue: 'Italy'
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

export class MockSandboxService {
  errorMode = false;

  /**
   * getCountries
   *
   * gets the country options
   *
   * @returns Array<string>
   **/
  getCountries(): Observable<Array<FieldOption>> {
    return of(mockCountries);
  }

  /**
   * getLanguages
   *
   * gets the language options
   *
   * @returns Array<string>
   **/
  getLanguages(): Observable<Array<FieldOption>> {
    return of(mockLanguages);
  }

  getRecordReport(_: string, __: string): Observable<RecordReport> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getRecordReport throws error`));
        })
      );
    }
    return of(mockRecordReport).pipe(delay(1));
  }

  requestProgress(_: string): Observable<Dataset> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock requestProgress throws error`));
        })
      );
    }
    const res = Object.assign({}, mockDataset);
    res.status = DatasetStatus.COMPLETED;
    return of(res).pipe(delay(1));
  }

  submitDataset(
    form: FormGroup,
    fileNames: Array<string>
  ): Observable<SubmissionResponseData | SubmissionResponseDataWrapped> {
    console.log(
      `mock submitDataset(${form.value.name}, ${form.value.country}, ${form.value.language}, ${form.value.url}, ${fileNames})`
    );
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock submitDataset throws error`));
        })
      );
    }
    return of({
      body: {
        'dataset-id': '1',
        'records-to-process': 1,
        'duplicate-records': 0
      }
    }).pipe(delay(1));
  }

  getProblemPatternsDataset(_: string): Observable<ProblemPatternsDataset> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getProblemPatternsDataset throws error`));
        })
      );
    }
    return of(mockProblemPatternsDataset).pipe(delay(1));
  }

  getProblemPatternsRecord(_: string, __: string): Observable<Array<ProblemPattern>> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getProblemPatternsRecord throws error`));
        })
      );
    }
    return of(mockProblemPatternsRecord).pipe(delay(1));
  }
}

export class MockSandboxServiceErrors extends MockSandboxService {
  errorMode = true;
}
