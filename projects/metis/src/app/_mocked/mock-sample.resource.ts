import { mockXmlSamples } from './';
import { XmlSample } from '../_models';

export class MockSampleResource {
  datasetId = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: (_: string): void => {}
  };

  xslt = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: (_: string): void => {}
  };

  originalSamples = {
    value: (): Array<XmlSample> => {
      return mockXmlSamples;
    },
    isLoading: (): boolean => {
      return false;
    }
  };

  transformedSamples = {
    value: (): Array<XmlSample> => {
      return mockXmlSamples;
    },
    isLoading: (): boolean => {
      return false;
    }
  };
}
