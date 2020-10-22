import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings';
import { MockHttp, MockHttpRequest } from '../_helpers/test-helpers';
import { of } from 'rxjs';

import {
  MockErrorService,
  mockPublicationInfoMoreResults,
  mockPublicationInfoResults
} from '../_mocked';
import { DatasetDepublicationInfo, SortDirection } from '../_models';
import { DepublicationService, ErrorService } from '.';

describe('depublication service', () => {
  let mockHttp: MockHttp;
  let service: DepublicationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [DepublicationService, { provide: ErrorService, useClass: MockErrorService }],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.inject(DepublicationService);
  }));

  it('should depublish a dataset', () => {
    const id = '123';
    let result = false;
    const sub = service.depublishDataset(id).subscribe((res) => {
      result = res;
    });
    mockHttp
      .expect('POST', `/depublish/execute/${id}?datasetDepublish=true`)
      .body(' ')
      .send(' ');
    sub.unsubscribe();
    expect(result).toBeTruthy();
  });

  it('should handle upload events', () => {
    const resProgess = DepublicationService.handleUploadEvents({
      type: HttpEventType.UploadProgress,
      loaded: 1,
      total: 1
    } as HttpEvent<Object>);
    const resResponse = DepublicationService.handleUploadEvents({
      type: HttpEventType.Response
    } as HttpEvent<Object>);
    expect(resProgess).toBeFalsy();
    expect(resResponse).toBeTruthy();
  });

  it('should flatten the publication info', () => {
    const perPage = 2;
    [0, 1, 2].forEach((endPage: number) => {
      service
        .flattenDatasetDepublicationInfos((_: number) => {
          return of(mockPublicationInfoMoreResults);
        }, endPage)
        .subscribe((publicationInfo: DatasetDepublicationInfo) => {
          const resultIds = publicationInfo.depublicationRecordIds.results;
          expect(resultIds.length).toEqual((endPage + 1) * perPage);
        })
        .unsubscribe();
    });
  });

  it('should get the publication info', fakeAsync(() => {
    const subPub = service.getPublicationInfo('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoResults);
    });
    mockHttp.expect('GET', '/depublish/record_ids/123?page=0').send(mockPublicationInfoResults);
    tick(1);
    subPub.unsubscribe();
  }));

  it('should get the publication info paginated', fakeAsync(() => {
    const subPub = service.getPublicationInfoUptoPage('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    mockHttp.expect('GET', '/depublish/record_ids/123?page=0').send(mockPublicationInfoMoreResults);
    tick(1);
    subPub.unsubscribe();
  }));

  it('should get the publication info filtered', fakeAsync(() => {
    const filter = 'xxx';
    const filterParamString = service.parseFilterParameter(filter);

    const subPub = service
      .getPublicationInfoUptoPage('123', 0, undefined, filter)
      .subscribe((publicationInfo) => {
        expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
      });
    mockHttp
      .expect('GET', '/depublish/record_ids/123?page=0' + filterParamString)
      .send(mockPublicationInfoMoreResults);
    tick(1);
    subPub.unsubscribe();
  }));

  it('should parse sort parameters', () => {
    expect(service.parseSortParameter({ field: 'x', direction: SortDirection.DESC })).toEqual(
      `&sortField=x&sortAscending=false`
    );
    expect(service.parseSortParameter({ field: 'a', direction: SortDirection.ASC })).toEqual(
      `&sortField=a&sortAscending=true`
    );
  });

  it('should get the publication info sorted', fakeAsync(() => {
    const sortParam = {
      field: 'field',
      direction: SortDirection.ASC
    };
    const sortParamString = service.parseSortParameter(sortParam);
    const subPub = service
      .getPublicationInfoUptoPage('123', 0, sortParam)
      .subscribe((publicationInfo) => {
        expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
      });
    mockHttp
      .expect('GET', '/depublish/record_ids/123?page=0' + sortParamString)
      .send(mockPublicationInfoMoreResults);
    tick(1);
    subPub.unsubscribe();
  }));

  it('should set the publication info', () => {
    let result = false;
    const ids = 'http://depublish/record_ids/id1 http://depublish/record_ids/id2';
    const sub = service.setPublicationInfo('123', ids).subscribe((res) => {
      result = res;
    });
    mockHttp
      .expect('POST', '/depublish/record_ids/123')
      .body(ids)
      .send({ result: true });
    sub.unsubscribe();
    expect(result).toBeTruthy();
  });

  it('should set the publication file', () => {
    spyOn(DepublicationService, 'handleUploadEvents');
    const dsId = '123';
    const file = { name: 'foo', size: 500001 } as File;
    const sub = service.setPublicationFile(dsId, file).subscribe((res) => {
      expect(res).toBeFalsy();
    });
    const url = `/depublish/record_ids/${dsId}`;
    const mockRequest = new MockHttpRequest(
      ({ flush: () => undefined, request: { body: {}, url: url } } as unknown) as TestRequest,
      url
    );
    mockRequest.send({ depublicationFile: file });
    expect(DepublicationService.handleUploadEvents).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('should delete the depublications', () => {
    const dsId = '0';
    const ids = ['111', '222'];
    const sub = service.deleteDepublications(dsId, ids).subscribe((res) => {
      expect(res);
    });
    const url = `/depublish/record_ids/${dsId}`;
    mockHttp
      .expect('DELETE', url)
      .body(ids.join('\n'))
      .send({ result: true });
    sub.unsubscribe();
  });

  it('should depublish the record ids', () => {
    const dsId = '0';
    const ids = ['111', '222'];
    const sub = service.depublishRecordIds(dsId, ids).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const url = `/depublish/execute/${dsId}?datasetDepublish=false`;
    mockHttp
      .expect('POST', url)
      .body(ids.join('\n'))
      .send({ result: true });
    sub.unsubscribe();
  });
});
