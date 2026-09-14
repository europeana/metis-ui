import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockDataset, mockXmlSamples, mockXslt } from '../_mocked';
import { DatasetsService } from '.';

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

  it('should get a dataset (cached)', async () => {
    const promise1 = firstValueFrom(service.getDataset('664'));
    const promise2 = firstValueFrom(service.getDataset('664'));

    mockHttp.expect('GET', '/datasets/664').send(mockDataset);

    const res1 = await promise1;
    const res2 = await promise2;

    expect(res1).toEqual(mockDataset);
    expect(res2).toEqual(mockDataset);
  });

  it('should get a dataset (uncached)', async () => {
    const promise1 = firstValueFrom(service.getDataset('665', true));
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
    expect(await promise1).toEqual(mockDataset);

    const promise2 = firstValueFrom(service.getDataset('665', true));
    mockHttp.expect('GET', '/datasets/665').send(mockDataset);
    expect(await promise2).toEqual(mockDataset);
  });

  it('should create a dataset', async () => {
    const formValues = { dataset: { datasetName: 'welcome' } };
    const promise = firstValueFrom(service.createDataset(formValues));

    mockHttp
      .expect('POST', '/datasets')
      .body(formValues)
      .send(mockDataset);

    expect(await promise).toEqual(mockDataset);
  });

  it('should update a dataset', async () => {
    const promise1 = firstValueFrom(service.getDataset('5'));
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
    await promise1;

    const formValues = { dataset: { datasetId: '5', datasetName: 'welcome' } };
    const promiseUpdate = firstValueFrom(service.updateDataset(formValues));
    mockHttp
      .expect('PUT', '/datasets')
      .body(formValues)
      .send(mockDataset);
    await promiseUpdate;

    const promise2 = firstValueFrom(service.getDataset('5'));
    mockHttp.expect('GET', '/datasets/5').send(mockDataset);
    expect(await promise2).toEqual(mockDataset);
  });

  it('should get the xslt', async () => {
    const promiseCustom = firstValueFrom(service.getXSLT('custom', '87'));
    mockHttp.expect('GET', '/datasets/87/xslt').send({ xslt: mockXslt });
    expect(await promiseCustom).toBe(mockXslt);

    const promiseDefault = firstValueFrom(service.getXSLT('default'));
    mockHttp.expect('GET', '/datasets/xslt/default').send(mockXslt);
    expect(await promiseDefault).toBe(mockXslt);
  });

  it('should search', () => {
    expect(service.search('x', 0)).toBeTruthy();
  });

  it('should get the paginated search results', () => {
    expect(service.getSearchResultsUptoPage('x', 0)).toBeTruthy();
  });

  it('should transform samples', async () => {
    const promiseCustom = firstValueFrom(service.getTransform('9783', mockXmlSamples, 'custom'));
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform')
      .body(mockXmlSamples)
      .send(mockXmlSamples);
    expect(await promiseCustom).toEqual(mockXmlSamples);

    const promiseDefault = firstValueFrom(service.getTransform('9783', mockXmlSamples, 'default'));
    mockHttp
      .expect('POST', '/datasets/9783/xslt/transform/default')
      .body(mockXmlSamples)
      .send(mockXmlSamples);
    expect(await promiseDefault).toEqual(mockXmlSamples);
  });
});
