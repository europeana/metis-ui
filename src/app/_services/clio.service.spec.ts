import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings';
import { MockHttp } from '../_helpers/test-helpers';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClioData } from '../_models';
import { ClioService } from '.';

describe('ClioService', () => {
  let service: ClioService;
  let mockHttp: MockHttp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ClioService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ClioService);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should load clio data', fakeAsync(() => {
    const datasetId = '0';
    const mockClioData = [{ score: 1, date: '2' }];
    const sub1 = service.loadClioData(datasetId).subscribe((data: Array<ClioData>) => {
      expect(data).toEqual(mockClioData);
    });
    mockHttp.expect('GET', `/orchestrator/clio/${datasetId}`).send(mockClioData);
    tick(1);
    sub1.unsubscribe();
  }));
});
