import { DatasetsService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentDataset = { 
    datasetId: '1',
    harvestingMetadata: 
      { pluginType: 'mocked', 
        mocked: false, 
        revisionNamePreviousPlugin: null, 
        revisionTimestampPreviousPlugin: null, 
        url: 'test'
       }
  }

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

  updateDataset() {
    return Observable.of(true);
  }

}
