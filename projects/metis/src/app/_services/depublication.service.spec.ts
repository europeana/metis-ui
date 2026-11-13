import { HttpEvent, HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { mockPublicationInfoMoreResults, mockPublicationInfoResults } from '../_mocked';
import { DatasetDepublicationInfo, SortDirection } from '../_models';
import { DepublicationService } from '.';

describe('DepublicationService', () => {
  let httpTesting: HttpTestingController;
  let service: DepublicationService;

  const expectRequest = (method: string, path: string) => {
    const req = httpTesting.expectOne({ method, url: `${apiSettings.apiHostCore}${path}` });
    return {
      body(expectedBody: unknown) {
        expect(req.request.body).toEqual(expectedBody);
        return this;
      },
      flush: (...args: Parameters<typeof req.flush>) => req.flush(...args)
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DepublicationService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should depublish a dataset', () => {
    const id = '123';
    const reason = 'GDPR';
    let result = false;
    const sub = service.depublishDataset(id, reason).subscribe((res) => {
      result = res;
    });
    expectRequest(
      'POST',
      `/depublish/execute/${id}?depublicationReason=${reason}&datasetDepublish=true`
    )
      .body(' ')
      .flush(' ');
    sub.unsubscribe();
    expect(result).toBeTruthy();
  });

  it('should handle upload events', () => {
    const resProgess = DepublicationService.handleUploadEvents({
      type: HttpEventType.UploadProgress,
      loaded: 1,
      total: 1
    } as HttpEvent<object>);
    const resResponse = DepublicationService.handleUploadEvents({
      type: HttpEventType.Response
    } as HttpEvent<object>);
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

  it('should get the publication info', async () => {
    const subPub = service.getPublicationInfo('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoResults);
    });
    expectRequest('GET', '/depublish/record_ids/123?page=0').flush(mockPublicationInfoResults);
    await Promise.resolve();
    subPub.unsubscribe();
  });

  it('should get the publication info paginated', async () => {
    const subPub = service.getPublicationInfoUptoPage('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    expectRequest('GET', '/depublish/record_ids/123?page=0').flush(mockPublicationInfoMoreResults);
    await Promise.resolve();
    subPub.unsubscribe();
  });

  it('should get the publication info filtered', async () => {
    const filter = 'xxx';
    const filterParamString = service.parseFilterParameter(filter);

    const subPub = service
      .getPublicationInfoUptoPage('123', 0, undefined, filter)
      .subscribe((publicationInfo) => {
        expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
      });
    expectRequest('GET', '/depublish/record_ids/123?page=0' + filterParamString).flush(
      mockPublicationInfoMoreResults
    );
    await Promise.resolve();
    subPub.unsubscribe();
  });

  it('should parse sort parameters', () => {
    expect(service.parseSortParameter({ field: 'x', direction: SortDirection.DESC })).toEqual(
      `&sortField=x&sortAscending=false`
    );
    expect(service.parseSortParameter({ field: 'a', direction: SortDirection.ASC })).toEqual(
      `&sortField=a&sortAscending=true`
    );
  });

  it('should get the publication info sorted', async () => {
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
    expectRequest('GET', '/depublish/record_ids/123?page=0' + sortParamString).flush(
      mockPublicationInfoMoreResults
    );
    await Promise.resolve();
    subPub.unsubscribe();
  });

  it('should set the publication info', () => {
    let result = false;
    const ids = 'http://depublish/record_ids/id1 http://depublish/record_ids/id2';
    const sub = service.setPublicationInfo('123', ids).subscribe((res) => {
      result = res;
    });
    expectRequest('POST', `/depublish/record_ids/123`)
      .body(ids)
      .flush({ result: true });
    sub.unsubscribe();
    expect(result).toBeTruthy();
  });

  it('should set the publication file', () => {
    vi.spyOn(DepublicationService, 'handleUploadEvents');
    const dsId = '123';
    const file = { name: 'foo', size: 500001, type: 'text/plain' } as File;
    const emitted: boolean[] = [];

    const sub = service.setPublicationFile(dsId, file).subscribe((res) => {
      emitted.push(res);
    });

    try {
      expectRequest(
        'POST',
        `/depublish/record_ids/${dsId}?clientFilename=${file.name}&mimeType=${file.type}`
      ).flush({ depublicationFile: file });

      expect(DepublicationService.handleUploadEvents).toHaveBeenCalled();
      expect(emitted).toEqual([false, true]);
    } finally {
      sub.unsubscribe();
    }
  });

  it('should delete the depublications', () => {
    const dsId = '0';
    const ids = ['111', '222'];
    const sub = service.deleteDepublications(dsId, ids).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    expectRequest('DELETE', `/depublish/record_ids/${dsId}`)
      .body(ids.join('\n'))
      .flush({ result: true });
    sub.unsubscribe();
  });

  it('should depublish the record ids', () => {
    const dsId = '0';
    const ids = ['111', '222'];
    const reason = 'Generic';
    const sub = service.depublishRecordIds(dsId, reason, ids).subscribe((res) => {
      expect(res).toBeTruthy();
    });
    const paramReason = `?depublicationReason=${reason}`;
    const param2 = '&datasetDepublish=false';
    expectRequest('POST', `/depublish/execute/${dsId}${paramReason}${param2}`)
      .body(ids.join('\n'))
      .flush({ result: true });
    sub.unsubscribe();
  });
});
