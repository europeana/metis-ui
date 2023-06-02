import { FormGroup } from '@angular/forms';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import {
  mockDataset,
  mockDatasetInfo,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockProcessedRecordData,
  mockRecordReport
} from '.';
import {
  Dataset,
  DatasetInfo,
  DatasetStatus,
  DatasetTierSummary,
  FieldOption,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
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

export const mockTierData = {
  license: 'CC1',
  'content-tier': 1,
  'metadata-tier-average': 'B',
  'metadata-tier-language': 'A',
  'metadata-tier-elements': 'C',
  'metadata-tier-classes': 'B',
  records: [
    {
      'record-id': '/123/GHSDF_AB_the_collected_works_of_nobody',
      license: 'CC1',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/123/GHSDF_CD_the_collected_works_of_nobody_in_particular',
      license: 'CC0',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/321/SDFGH_DC_collected_works',
      license: 'CC-BY',
      'content-tier': 4,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/201/XCVBN_EF_the_collected_works_of_nobody',
      license: 'CC0',
      'content-tier': 2,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'In Copyright',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/375/XCVBN_GH_the_collected_works_of_nobody',
      license: 'CC0',
      'content-tier': 1,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'CC-BY-SA',
      'content-tier': 1,
      'metadata-tier-average': 'A',
      'metadata-tier-language': 'B',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/324/UVBNMJ_GH_the_collected_anthology',
      license: 'CC-BY-SA-NC',
      'content-tier': 0,
      'metadata-tier-average': 'D',
      'metadata-tier-language': 'D',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'D'
    },
    {
      'record-id': '/322/UVVBN_EF_the_collected_works',
      license: 'In Copyright',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'C'
    },
    {
      'record-id': '/321/UVXXXX_HJ_the_collected_anthology',
      license: 'CC-BY',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'B'
    }
  ]
} as DatasetTierSummary;

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

  requestDatasetInfo(_: string): Observable<DatasetInfo> {
    const res = Object.assign({}, mockDatasetInfo);
    return of(res).pipe(delay(1));
  }

  getDatasetInfo(_: string): Observable<DatasetInfo> {
    return this.requestDatasetInfo(_);
  }

  getDatasetTierSummary(): Observable<DatasetTierSummary> {
    return of(mockTierData);
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

  getProblemPatternsRecordWrapped(datasetId: string, _: string): Observable<ProblemPatternsRecord> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getProblemPatternsRecordWrapped throws error`));
        })
      );
    }
    return of({
      datasetId: datasetId,
      problemPatternList: mockProblemPatternsRecord
    }).pipe(delay(1));
  }

  getProcessedRecordData(_: string, __: string): Observable<ProcessedRecordData> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getProcessedRecordData throws error`));
        })
      );
    }
    return of(mockProcessedRecordData);
  }
}

export class MockSandboxServiceErrors extends MockSandboxService {
  errorMode = true;
}
