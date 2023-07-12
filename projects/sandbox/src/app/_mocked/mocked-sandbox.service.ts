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
  ContentTierValue,
  Dataset,
  DatasetInfo,
  DatasetStatus,
  DatasetTierSummary,
  DatasetTierSummaryBase,
  DatasetTierSummaryRecord,
  FieldOption,
  LicenseType,
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
  content_tier: 1,
  metadata_tier: 'B',
  metadata_tier_language: 'A',
  metadata_tier_enabling_elements: 'C',
  metadata_tier_contextual_classes: 'B',
  records: [
    {
      europeana_id: '/123/GHSDF_AB_the_collected_works_of_nobody',
      license: 'CC1',
      content_tier: 1,
      metadata_tier: 'B',
      metadata_tier_language: 'A',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'B'
    },
    {
      europeana_id: '/123/GHSDF_CD_the_collected_works_of_nobody_in_particular',
      license: 'CC0',
      content_tier: 3,
      metadata_tier: 'C',
      metadata_tier_language: 'C',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'B'
    },
    {
      europeana_id: '/321/SDFGH_DC_collected_works',
      license: 'CC-BY',
      content_tier: 4,
      metadata_tier: 'B',
      metadata_tier_language: 'A',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'B'
    },
    {
      europeana_id: '/201/XCVBN_EF_the_collected_works_of_nobody',
      license: 'CC0',
      content_tier: 2,
      metadata_tier: 'C',
      metadata_tier_language: 'C',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'B'
    },
    {
      europeana_id: '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'In Copyright',
      content_tier: 1,
      metadata_tier: 'B',
      metadata_tier_language: 'C',
      metadata_tier_enabling_elements: 'A',
      metadata_tier_contextual_classes: 'A'
    },
    {
      europeana_id: '/375/XCVBN_GH_the_collected_works_of_nobody',
      license: 'CC0',
      content_tier: 1,
      metadata_tier: 'C',
      metadata_tier_language: 'C',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'B'
    },
    {
      europeana_id: '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'CC-BY-SA',
      content_tier: 1,
      metadata_tier: 'A',
      metadata_tier_language: 'B',
      metadata_tier_enabling_elements: 'A',
      metadata_tier_contextual_classes: 'A'
    },
    {
      europeana_id: '/324/UVBNMJ_GH_the_collected_anthology',
      license: 'CC-BY-SA-NC',
      content_tier: 0,
      metadata_tier: 'D',
      metadata_tier_language: 'D',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'D'
    },
    {
      europeana_id: '/322/UVVBN_EF_the_collected_works',
      license: 'In Copyright',
      content_tier: 3,
      metadata_tier: 'C',
      metadata_tier_language: 'C',
      metadata_tier_enabling_elements: 'C',
      metadata_tier_contextual_classes: 'C'
    },
    {
      europeana_id: '/321/UVXXXX_HJ_the_collected_anthology',
      license: 'CC-BY',
      content_tier: 1,
      metadata_tier: 'B',
      metadata_tier_language: 'A',
      metadata_tier_enabling_elements: 'A',
      metadata_tier_contextual_classes: 'B'
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

  getDatasetTierSummary(_: number): Observable<DatasetTierSummary> {
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

// Temporary code for tier generation
const varAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const valStringMetadata = varAlphabet.substr(0, 4);
const licenses = [LicenseType.OPEN, LicenseType.CLOSED, LicenseType.RESTRICTED];

function generateDatasetTierSummaryBase(
  index: number,
  licenseRandomiser: number
): DatasetTierSummaryBase {
  let total = 0;
  const metaVals = [index % 13, index % 21, index % 34].map((index2: number) => {
    const letterIndex = index2 % 4;
    total += letterIndex;
    return valStringMetadata.substr(letterIndex, 1);
  });

  return {
    license: licenses[(index * licenseRandomiser) % licenses.length],
    content_tier: (index % 5) as ContentTierValue,
    metadata_tier: valStringMetadata.substr(total / metaVals.length, 1),
    metadata_tier_language: metaVals[0],
    metadata_tier_enabling_elements: metaVals[1],
    metadata_tier_contextual_classes: metaVals[2]
  } as DatasetTierSummaryBase;
}

export function generateTierSummary(index: number): DatasetTierSummary {
  const dts = generateDatasetTierSummaryBase(index * index, 0) as DatasetTierSummary;
  const recordCount = (index % 2 === 1 ? index : index * 50) % 1000;
  const fillerCharCountMax = index % 25;

  dts['records'] = [];

  for (let i = 0; i < recordCount; i++) {
    let fillerCharsFull = '';

    for (let j = 0; j < fillerCharCountMax; j++) {
      fillerCharsFull += varAlphabet.substr(((index + i * 13) * j) % varAlphabet.length, 1);
    }
    if (index % 3 === 0) {
      fillerCharsFull = fillerCharsFull
        .split('')
        .reverse()
        .join('');
    }

    const fillerChars = fillerCharsFull.substr((i * 3) % 10, fillerCharCountMax);
    const baseRecord = generateDatasetTierSummaryBase(index + i, i + 1) as DatasetTierSummaryRecord;
    baseRecord['europeana_id'] = `/${index}/${fillerChars}_record-id_${fillerCharCountMax}_${i}`;
    dts['records'].push(baseRecord);
  }
  return dts;
}
