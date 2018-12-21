import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import { MockHttp } from '../_helpers/test-helpers';
import { mockDataset, MockErrorService, mockXmlSamples, mockXslt } from '../_mocked';

import { DatasetsService, ErrorService } from '.';

describe('dataset service', () => {
  let mockHttp: MockHttp;
  let service: DatasetsService;

  beforeEach(async(() => {
    localStorage.setItem('favoriteDatasetIds', '["5", "6736"]');

    TestBed.configureTestingModule({
      providers: [DatasetsService, { provide: ErrorService, useClass: MockErrorService }],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.get(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.get(DatasetsService);
  }));

  afterEach(() => {
    mockHttp.verify();

    localStorage.removeItem('favoriteDatasetIds');
  });

  it('should get a dataset (cached)', () => {
    service.getDataset('664').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    service.getDataset('664').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/664').send(mockDataset);
  });

  it('should get a dataset (uncached)', () => {
    service.getDataset('665', true).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
    service.getDataset('665', true).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
  });

  it('should create a dataset', () => {
    const formValues = { dataset: { datasetName: 'welcome' } };
    service.createDataset(formValues).subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp
      .expect('POST', '/datasets')
      .body(formValues)
      .send(mockDataset);
  });

  it('should update a dataset', () => {
    service.getDataset('5').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);

    const formValues = { dataset: { datasetId: '5', datasetName: 'welcome' } };
    service.updateDataset(formValues).subscribe(() => {});
    mockHttp
      .expect('PUT', '/datasets')
      .body(formValues)
      .send(mockDataset);

    // the cache was cleared for this dataset
    // so retrieving this dataset should cause a new request
    service.getDataset('5').subscribe((dataset) => {
      expect(dataset).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
  });

  it('should get the xslt', () => {
    service.getXSLT('custom', '87').subscribe((xslt) => {
      expect(xslt).toBe(mockXslt);
    });
    mockHttp.expect('GET', '/datasets/87/xslt').send({ xslt: mockXslt });

    service.getXSLT('default').subscribe((xslt) => {
      expect(xslt).toBe(mockXslt);
    });
    mockHttp.expect('GET', '/datasets/xslt/default').send(mockXslt);
  });

  it('should transform samples', () => {
    service.getTransform('9783', mockXmlSamples, 'custom').subscribe((samples) => {
      expect(samples).toEqual(mockXmlSamples);
    });
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform')
      .body(mockXmlSamples)
      .send(mockXmlSamples);

    service.getTransform('9783', mockXmlSamples, 'default').subscribe((samples) => {
      expect(samples).toEqual(mockXmlSamples);
    });
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform/default')
      .body(mockXmlSamples)
      .send(mockXmlSamples);
  });

  it('should know if a dataset is a favorite', () => {
    expect(service.isFavorite(mockDataset)).toBe(false);
    expect(service.isFavorite({ ...mockDataset, datasetId: '5' })).toBe(true);
  });

  it('should have favorites', () => {
    expect(service.hasFavorites()).toBe(true);
  });

  it('should add favorites', () => {
    service.addFavorite({ ...mockDataset, datasetId: '456' });
    service.addFavorite({ ...mockDataset, datasetId: '975644' });
    expect(localStorage.getItem('favoriteDatasetIds')).toBe('["5","456","6736","975644"]');
  });

  it('should remove favorites', () => {
    service.removeFavorite({ ...mockDataset, datasetId: '456' });
    service.removeFavorite({ ...mockDataset, datasetId: '6736' });
    expect(localStorage.getItem('favoriteDatasetIds')).toBe('["5"]');
  });

  it('should get favorites', () => {
    service.getFavorites().subscribe((datasets) => {
      expect(datasets).toEqual([mockDataset, mockDataset]);
    });
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
    mockHttp.expect('GET', '/datasets/6736').send(mockDataset);
  });
});
