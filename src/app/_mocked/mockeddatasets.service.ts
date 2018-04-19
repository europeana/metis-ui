import { DatasetsService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentDataset = { 
    country: {enum: 'CHINA', name: 'China', isoCode: 'CN'},
    createdByUserId: '1',
    createdDate: '2018-03-30T13:49:55.607Z',
    dataProvider: 'mockedDataProvider',
    datasetId: '1',
    datasetName: 'mockedName',
    description: 'mockedDescription',
    ecloudDatasetId: 1,
    id: 1,
    intermediateProvider: 'mockedIntermediateProvider',
    language: {enum: 'FR', name: 'French'},
    notes: 'mockedNotes',
    organizationId: 1,
    organizationName: 'mockedOrganization',
    provider: 'mockedProvider',
    replacedBy: 'mocked',
    replaces: 'mocked',
    updatedDate: '2018-04-03T07:49:42.275Z',
    xsltId: null
  };

export let xslt = `<?xml version="1.0" encoding="UTF-8"?>
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

export class MockDatasetService extends DatasetsService {

	getXSLT() {
		return Observable.of(xslt);
	}

  getDataset() {
    return Observable.of(currentDataset);
  }

  updateDataset() {
    return Observable.of(true);
  }

  createDataset(datasetFormValues: Array<any>) {    
    return Observable.of(currentDataset);
  }

}
