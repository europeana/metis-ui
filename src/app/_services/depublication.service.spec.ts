import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings';
import { MockHttp } from '../_helpers/test-helpers';
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
    mockHttp = new MockHttp(TestBed.get(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.get(DepublicationService);
  }));

  it('should depublish a dataset', async(() => {
    service
      .depublishDataset('123')
      .subscribe((res) => {
        expect(res).toEqual(true);
      })
      .unsubscribe();
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

  it('should get the publication info', () => {
    service.getPublicationInfo('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoResults);
    });
    mockHttp.expect('GET', '/depublish/record_ids/123?page=0').send(mockPublicationInfoResults);
  });

  it('should get the publication info paginated', () => {
    service.getPublicationInfoUptoPage('123', 0).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    mockHttp.expect('GET', '/depublish/record_ids/123?page=0').send(mockPublicationInfoMoreResults);
  });

  it('should get the publication info filtered', () => {
    const filter = 'xxx';
    const filterParamString = service.parseFilterParameter(filter);

    service.getPublicationInfoUptoPage('123', 0, undefined, filter).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    mockHttp
      .expect('GET', '/depublish/record_ids/123?page=0' + filterParamString)
      .send(mockPublicationInfoMoreResults);
  });

  it('should parse sort parameters', () => {
    expect(service.parseSortParameter({ field: 'x', direction: SortDirection.DESC })).toEqual(
      `&sortField=x&sortAscending=false`
    );
    expect(service.parseSortParameter({ field: 'a', direction: SortDirection.ASC })).toEqual(
      `&sortField=a&sortAscending=true`
    );
  });

  it('should get the publication info sorted', () => {
    const sortParam = {
      field: 'field',
      direction: SortDirection.ASC
    };
    const sortParamString = service.parseSortParameter(sortParam);

    service.getPublicationInfoUptoPage('123', 0, sortParam).subscribe((publicationInfo) => {
      expect(publicationInfo).toEqual(mockPublicationInfoMoreResults);
    });
    mockHttp
      .expect('GET', '/depublish/record_ids/123?page=0' + sortParamString)
      .send(mockPublicationInfoMoreResults);
  });

  it('should set the publication info', () => {
    service
      .setPublicationInfo('123', 'http://depublish/record_ids/id1 http://depublish/record_ids/id2')
      .subscribe((res) => {
        expect(res).toEqual(true);
      });
  });

  it('should set the publication file', () => {
    service.setPublicationFile('123', { name: 'foo', size: 500001 } as File).subscribe((res) => {
      console.log('res = ' + res);
      expect(res).toEqual(false);
    });
  });

  it('should delete the depublications', () => {
    service.deleteDepublications('0', ['111', '222']).subscribe((res) => {
      expect(res);
    });
  });

  it('should depublish the record ids', () => {
    service.depublishRecordIds('0', ['111', '222']).subscribe((res) => {
      expect(res);
    });
  });
});
