import { FormGroup } from '@angular/forms';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import {
  DatasetProgress,
  DatasetInfo,
  DatasetStatus,
  FieldOption,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped,
  TierSummaryRecord
} from '../_models';
import {
  mockDataset,
  mockDatasetInfo,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockProcessedRecordData,
  mockRecordReport
} from '.';

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

export const mockRecordData = [
  {
    'record-id': '/123/GHSDF_AB_the_collected_works_of_nobody',
    license: 'CC1',
    'content-tier': 1,
    'metadata-tier': 'B',
    'metadata-tier-language': 'A',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'B'
  },
  {
    'record-id': '/123/GHSDF_CD_the_collected_works_of_nobody_in_particular',
    license: 'CC0',
    'content-tier': 3,
    'metadata-tier': 'C',
    'metadata-tier-language': 'C',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'B'
  },
  {
    'record-id': '/321/SDFGH_DC_collected_works',
    license: 'CC-BY',
    'content-tier': 4,
    'metadata-tier': 'B',
    'metadata-tier-language': 'A',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'B'
  },
  {
    'record-id': '/201/XCVBN_EF_the_collected_works_of_nobody',
    license: 'CC0',
    'content-tier': 2,
    'metadata-tier': 'C',
    'metadata-tier-language': 'C',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'B'
  },
  {
    'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
    license: 'In Copyright',
    'content-tier': 1,
    'metadata-tier': 'B',
    'metadata-tier-language': 'C',
    'metadata-tier-enabling-elements': 'A',
    'metadata-tier-contextual-classes': 'A'
  },
  {
    'record-id': '/375/XCVBN_GH_the_collected_works_of_nobody',
    license: 'CC0',
    'content-tier': 1,
    'metadata-tier': 'C',
    'metadata-tier-language': 'C',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'B'
  },
  {
    'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
    license: 'CC-BY-SA',
    'content-tier': 1,
    'metadata-tier': 'A',
    'metadata-tier-language': 'B',
    'metadata-tier-enabling-elements': 'A',
    'metadata-tier-contextual-classes': 'A'
  },
  {
    'record-id': '/324/UVBNMJ_GH_the_collected_anthology',
    license: 'CC-BY-SA-NC',
    'content-tier': 0,
    'metadata-tier': 'D',
    'metadata-tier-language': 'D',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'D'
  },
  {
    'record-id': '/322/UVVBN_EF_the_collected_works',
    license: 'In Copyright',
    'content-tier': 3,
    'metadata-tier': 'C',
    'metadata-tier-language': 'C',
    'metadata-tier-enabling-elements': 'C',
    'metadata-tier-contextual-classes': 'C'
  },
  {
    'record-id': '/321/UVXXXX_HJ_the_collected_anthology',
    license: 'CC-BY',
    'content-tier': 1,
    'metadata-tier': 'B',
    'metadata-tier-language': 'A',
    'metadata-tier-enabling-elements': 'A',
    'metadata-tier-contextual-classes': 'B'
  }
] as Array<TierSummaryRecord>;

export class MockSandboxService {
  errorMode = false;

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

  requestProgress(_: string): Observable<DatasetProgress> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock requestProgress throws error`));
        })
      );
    }
    const res = structuredClone(mockDataset);
    res.status = DatasetStatus.COMPLETED;
    return of(res).pipe(delay(1));
  }

  requestDatasetInfo(_: string): Observable<DatasetInfo> {
    const res = structuredClone(mockDatasetInfo);
    return of(res).pipe(delay(1));
  }

  getDatasetInfo(_: string): Observable<DatasetInfo> {
    return this.requestDatasetInfo(_);
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

  getDatasetRecords(_: number): Observable<Array<TierSummaryRecord>> {
    return of(mockRecordData);
  }
}

export class MockSandboxServiceErrors extends MockSandboxService {
  errorMode = true;
}
