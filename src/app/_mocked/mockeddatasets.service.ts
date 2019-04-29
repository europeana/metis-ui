import { Observable, of as observableOf } from 'rxjs';

import { Dataset, XmlSample } from '../_models';

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

export class MockDatasetsService {
  getXSLT(): Observable<string> {
    return observableOf(mockXslt);
  }

  getDataset(): Observable<Dataset> {
    return observableOf(mockDataset);
  }

  updateDataset(): Observable<void> {
    return observableOf(undefined);
  }

  // tslint:disable-next-line: no-any
  createDataset(_: { dataset: any }): Observable<Dataset> {
    return observableOf(mockDataset);
  }

  getTransform(): Observable<XmlSample[]> {
    return observableOf(mockXmlSamples);
  }

  isFavorite(): boolean {
    return false;
  }

  getFavorites(): Observable<Dataset[]> {
    return observableOf([mockDataset]);
  }
}
