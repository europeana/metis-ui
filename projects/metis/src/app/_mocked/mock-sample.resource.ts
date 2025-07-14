import { HttpErrorResponse } from '@angular/common/http';
import { mockXmlSamples } from './';
import { XmlSample } from '../_models';

export class MockSampleResource {
  datasetId = {
    set: (_: string): undefined | string => {
      return '1';
    }
  };

  xslt = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: (_: string): void => {}
  };

  httpError = (): undefined | HttpErrorResponse => {
    return undefined;
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
