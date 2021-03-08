import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { MockHttp } from '@shared';
import { apiSettings } from '../../environments/apisettings';
import { mockDatasetInfo } from '../_mocked';
import { SandboxService } from '.';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SandboxService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(SandboxService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the progress', () => {
    const sub = service.requestProgress('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDatasetInfo);
    });
    mockHttp.expect('GET', '/dataset/1').send(mockDatasetInfo);
    sub.unsubscribe();
  });
});
