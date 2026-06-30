import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { DebiasDereferenceResult, DebiasInfo, DebiasReport } from '../_models';
import { DebiasService } from '.';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('debias service', () => {
  let mockHttp: MockHttp;
  let service: DebiasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(DebiasService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    mockHttp.verify();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should get the debias info', async () => {
    const datasetId = '123';
    const sub = service.getDebiasInfo(datasetId).subscribe((di: DebiasInfo) => {
      expect(di).toBeTruthy();
    });
    mockHttp.expect('GET', `/dataset/${datasetId}/debias/info`).send(datasetId);
    await Promise.resolve();
    sub.unsubscribe();
  });

  it('should poll the debias info', async () => {
    const datasetId = '123';
    const testModel = { set: vi.fn() } as any;

    service.pollDebiasInfo(datasetId, testModel);

    // 1. Move the clock forward to trigger the timer
    await vi.advanceTimersByTimeAsync(apiSettings.interval);

    // 2. NOW the HTTP request is pending. Flush it.
    // Make sure to send a state that doesn't trigger the 'takeWhile' exit immediately if you want to test multiple polls
    mockHttp.expect('GET', `/dataset/${datasetId}/debias/info`).send({
      state: 'RUNNING'
    });

    // 3. Wait for the microtask queue to clear (the .subscribe block)
    await Promise.resolve();

    expect(testModel.set).toHaveBeenCalled();
  });

  it('should get the debias report', () => {
    const datasetId = '123';
    const sub = service.getDebiasReport(datasetId).subscribe((dr: DebiasReport) => {
      expect(dr).toBeTruthy();
    });
    mockHttp.expect('GET', `/dataset/${datasetId}/debias/report`).send(datasetId);
    sub.unsubscribe();
  });

  it('should run the debias report', () => {
    const datasetId = '123';
    const sub = service.runDebiasReport(datasetId).subscribe((tf: boolean) => {
      expect(tf).toBeTruthy();
    });
    mockHttp.expect('POST', `/dataset/${datasetId}/debias`).send(datasetId);
    sub.unsubscribe();
  });

  it('should dereference the debias info', () => {
    const url = 'http://some-url';
    const urlEncoded = encodeURIComponent(url);
    const sub = service.derefDebiasInfo(url).subscribe((res: DebiasDereferenceResult) => {
      expect(res).toBeTruthy();
    });
    mockHttp.expect('GET', `/dereference?uri=${urlEncoded}`).send({});
    sub.unsubscribe();
  });
});
