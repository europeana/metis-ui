import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import { DebiasDereferenceResult, DebiasInfo, DebiasReport } from '../_models';
import { DebiasService } from '.';

describe('DebiasService', () => {
  let httpTesting: HttpTestingController;
  let service: DebiasService;

  const expectRequest = (method: string, path: string) =>
    httpTesting.expectOne({ method, url: `${apiSettings.apiHost}${path}` });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DebiasService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  it('should get the debias info', async () => {
    const datasetId = '123';
    const sub = service.getDebiasInfo(datasetId).subscribe((di: DebiasInfo) => {
      expect(di).toBeTruthy();
    });

    expectRequest('GET', `/dataset/${datasetId}/debias/info`).flush(datasetId);
    await Promise.resolve();
    sub.unsubscribe();
  });

  it('should poll the debias info', async () => {
    const datasetId = '123';
    const testModel = { set: vi.fn() } as any;

    service.pollDebiasInfo(datasetId, testModel);

    await vi.advanceTimersByTimeAsync(apiSettings.interval);

    expectRequest('GET', `/dataset/${datasetId}/debias/info`).flush({
      state: 'RUNNING'
    });

    await Promise.resolve();

    expect(testModel.set).toHaveBeenCalled();
  });

  it('should get the debias report', () => {
    const datasetId = '123';
    const sub = service.getDebiasReport(datasetId).subscribe((dr: DebiasReport) => {
      expect(dr).toBeTruthy();
    });
    expectRequest('GET', `/dataset/${datasetId}/debias/report`).flush(datasetId);
    sub.unsubscribe();
  });

  it('should run the debias report', () => {
    const datasetId = '123';
    const sub = service.runDebiasReport(datasetId).subscribe((tf: boolean) => {
      expect(tf).toBeTruthy();
    });
    expectRequest('POST', `/dataset/${datasetId}/debias`).flush(datasetId);
    sub.unsubscribe();
  });

  it('should dereference the debias info', () => {
    const url = 'http://some-url';
    const urlEncoded = encodeURIComponent(url);
    const sub = service.derefDebiasInfo(url).subscribe((res: DebiasDereferenceResult) => {
      expect(res).toBeTruthy();
    });
    expectRequest('GET', `/dereference?uri=${urlEncoded}`).flush({});
    sub.unsubscribe();
  });
});
