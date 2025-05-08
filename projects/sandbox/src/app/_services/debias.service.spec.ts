import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
        DebiasService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(DebiasService);
  });

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get the debias info', () => {
    const datasetId = '123';
    const sub = service.getDebiasInfo(datasetId).subscribe((di: DebiasInfo) => {
      expect(di).toBeTruthy();
    });
    mockHttp.expect('GET', `/dataset/${datasetId}/debias/info`).send(datasetId);
    sub.unsubscribe();
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
