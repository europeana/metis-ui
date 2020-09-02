import { Observable, of as observableOf, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Dataset, DatasetSearchView, MoreResults, XmlSample } from '../_models';

export const mockDataset: Dataset = {
  country: { enum: 'CHINA', name: 'China', isoCode: 'CN' },
  createdByUserId: '1',
  createdDate: '2018-03-30T13:49:55.607Z',
  dataProvider: 'mockedDataProvider',
  datasetId: '1',
  datasetName: 'mockedName',
  description: 'mockedDescription',
  ecloudDatasetId: '1',
  id: '1',
  intermediateProvider: 'mockedIntermediateProvider',
  language: { enum: 'FR', name: 'French' },
  notes: 'mockedNotes',
  organizationId: '1',
  organizationName: 'mockedOrganization',
  provider: 'mockedProvider',
  datasetIdsToRedirectFrom: ['123', '321'],
  replacedBy: 'mocked',
  replaces: 'mocked',
  updatedDate: '2018-04-03T07:49:42.275Z',
  xsltId: null
};

export const mockXslt = `<?xml version="1.0" encoding="UTF-8"?>
  <xsl:stylesheet version="2.0">
    <!-- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -->
    <xsl:template match="/">
      <xsl:apply-templates select="/rdf:RDF" />
    </xsl:template>
    <!-- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -->
    <xsl:template match="/">
      <xsl:apply-templates select="/rdf:RDF" />
    </xsl:template>
  </xsl:stylesheet>`;

const mockXmlSamples: XmlSample[] = [
  {
    ecloudId: '1',
    xmlRecord: '<?xml version="1.0" encoding="UTF-8"?>'
  }
];

const mockSearchResults: DatasetSearchView[] = [
  {
    datasetId: '123',
    datasetName: 'Dataset_123',
    provider: 'Test Provider',
    dataProvider: 'Test Data Provider',
    lastExecutionDate: '2018-04-03T07:49:42.275Z'
  },
  {
    datasetId: '321',
    datasetName: 'Dataset_321',
    provider: 'Test Provider',
    dataProvider: 'Test Data Provider',
    lastExecutionDate: '2018-05-03T07:49:42.275Z'
  }
];

export class MockDatasetsService {
  errorMode = false;

  getXSLT(): Observable<string> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock getXSLT throws error...'));
        })
      );
    }
    return observableOf(mockXslt).pipe(delay(1));
  }

  getDataset(): Observable<Dataset> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock getDataset throws error...'));
        })
      );
    }
    return observableOf(mockDataset).pipe(delay(1));
  }

  updateDataset(): Observable<void> {
    return observableOf(undefined).pipe(delay(1));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDataset(_: { dataset: any }): Observable<Dataset> {
    return observableOf(mockDataset);
  }

  getTransform(): Observable<XmlSample[]> {
    return observableOf(mockXmlSamples);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSearchResultsUptoPage(term: string, _: number): Observable<MoreResults<DatasetSearchView>> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(
            new Error(`mock getSearchResultsUptoPage with term "${term}" throws error`)
          );
        })
      );
    }
    return observableOf({ results: mockSearchResults, more: false }).pipe(delay(1));
  }
}

export class MockDatasetsServiceErrors extends MockDatasetsService {
  errorMode = true;
}
