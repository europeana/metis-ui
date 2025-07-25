import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockDataset, mockXmlSamples, mockXslt } from '../_mocked';
import { DatasetsService } from '.';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('dataset service', () => {
  let mockHttp: MockHttp;
  let service: DatasetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatasetsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.inject(DatasetsService);
  });

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get a dataset (cached)', fakeAsync(() => {
    const sub1 = service.getDataset('664').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    const sub2 = service.getDataset('664').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/664').send(mockDataset);
    tick(1);
    sub1.unsubscribe();
    sub2.unsubscribe();
  }));

  it('should get a dataset (uncached)', () => {
    const sub1 = service.getDataset('665', true).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
    const sub2 = service.getDataset('665', true).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should create a dataset', fakeAsync(() => {
    const formValues = { dataset: { datasetName: 'welcome' } };
    const subCreate = service.createDataset(formValues).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp
      .expect('POST', '/datasets')
      .body(formValues)
      .send(mockDataset);
    subCreate.unsubscribe();
  }));

  it('should update a dataset', fakeAsync(() => {
    const sub1 = service.getDataset('5').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
    sub1.unsubscribe();

    const formValues = { dataset: { datasetId: '5', datasetName: 'welcome' } };
    const subUpdate = service.updateDataset(formValues).subscribe(() => undefined);
    tick(1);
    mockHttp
      .expect('PUT', '/datasets')
      .body(formValues)
      .send(mockDataset);
    subUpdate.unsubscribe();

    // the cache was cleared for this dataset
    // so retrieving this dataset should cause a new request
    const sub2 = service.getDataset('5').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
    sub2.unsubscribe();
  }));

  it('should get the xslt', fakeAsync(() => {
    const subXSLT1 = service.getXSLT('custom', '87').subscribe((xslt) => {
      expect(xslt).toBe(mockXslt);
    });
    mockHttp.expect('GET', '/datasets/87/xslt').send({ xslt: mockXslt });
    tick(1);
    subXSLT1.unsubscribe();

    const subXSLT2 = service.getXSLT('default').subscribe((xslt) => {
      expect(xslt).toBe(mockXslt);
    });
    mockHttp.expect('GET', '/datasets/xslt/default').send(mockXslt);
    tick(1);
    subXSLT2.unsubscribe();
  }));

  it('should search', fakeAsync(() => {
    expect(service.search('x', 0)).toBeTruthy();
  }));

  it('should get the paginated search results', fakeAsync(() => {
    expect(service.getSearchResultsUptoPage('x', 0)).toBeTruthy();
  }));

  it('should transform samples', fakeAsync(() => {
    const subTransform1 = service
      .getTransform('9783', mockXmlSamples, 'custom')
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform')
      .body(mockXmlSamples)
      .send(mockXmlSamples);
    tick(1);
    subTransform1.unsubscribe();

    const subTransform2 = service
      .getTransform('9783', mockXmlSamples, 'default')
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform/default')
      .body(mockXmlSamples)
      .send(mockXmlSamples);
    tick(1);
    subTransform2.unsubscribe();
  }));
});
