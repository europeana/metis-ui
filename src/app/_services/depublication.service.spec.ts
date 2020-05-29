import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings';
import { MockHttp } from '../_helpers/test-helpers';
import {
  MockErrorService,
  mockPublicationInfoMoreResults,
  mockPublicationInfoResults
} from '../_mocked';
import { DepublicationService, ErrorService } from '.';

describe('depublication service', () => {
  let mockHttp: MockHttp;
  let service: DepublicationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [DepublicationService, { provide: ErrorService, useClass: MockErrorService }],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.get(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.get(DepublicationService);
  }));

  it('should handle upload events', () => {
    const resProgess = service.handleUploadEvents({
      type: HttpEventType.UploadProgress,
      loaded: 1,
      total: 1
    } as HttpEvent<Object>);
    const resResponse = service.handleUploadEvents({
      type: HttpEventType.Response
    } as HttpEvent<Object>);
    expect(resProgess).toBeFalsy();
    expect(resResponse).toBeTruthy();
  });

  it('should get the publication info', () => {
    service.getPublicationInfo('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoResults);
    });
    mockHttp.expect('GET', '/records/123?nextPage=0&sort=1').send(mockPublicationInfoResults);
  });

  it('should get the publication info paginated', () => {
    service.getPublicationInfoUptoPage('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    mockHttp.expect('GET', '/records/123?nextPage=0&sort=1').send(mockPublicationInfoMoreResults);
  });

  it('should set the publication info', () => {
    service.setPublicationInfo('123', 'http://records/id1 http://records/id2').subscribe((res) => {
      expect(res).toEqual(true);
    });
  });

  it('should set the publication file', () => {
    service.setPublicationFile('123', { name: 'foo', size: 500001 } as File).subscribe((res) => {
      console.log('res = ' + res);
      expect(res).toEqual(false);
    });
  });
});
