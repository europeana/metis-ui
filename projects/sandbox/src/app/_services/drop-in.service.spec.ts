import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ModelSignal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockUserDatasets } from '../_mocked';
import {
  //DatasetStatus,
  DropInModel
  //, UserDatasetInfo
} from '../_models';

import { DropInService } from '../_services';

describe('DropInService', () => {
  let mockHttp: MockHttp;
  let service: DropInService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    service = TestBed.inject(DropInService);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    console.log(!!mockHttp);
  };

  const initModelData = (): ModelSignal<Array<DropInModel>> => {
    return ({
      set: jasmine.createSpy()
    } as unknown) as ModelSignal<Array<DropInModel>>;
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should getDatsets', () => {
      expect(service.getUserDatsets()).toBeTruthy();
    });

    it('should unsub', () => {
      const serverResult = [...mockUserDatasets];
      spyOn(service, 'getUserDatsets').and.callFake(() => {
        return of(serverResult);
      });
      const spy = jasmine.createSpy();
      service.sub = { unsubscribe: spy } as any;

      console.log(!!initModelData);

      /*
      service.getDropInModel2(initModelData());
      expect(spy).toHaveBeenCalled();
      */
    });

    it('should getDropInModel2', fakeAsync(() => {
      const serverResult = [...mockUserDatasets];
      spyOn(service, 'getUserDatsets').and.callFake(() => {
        return of(serverResult);
      });

      const modelData = ({
        set: jasmine.createSpy()
      } as unknown) as ModelSignal<Array<DropInModel>>;

      console.log(modelData);
      /*
      service.getDropInModel2(modelData);
      */

      tick(0);

      /*
      expect(modelData.set).toHaveBeenCalled();
      tick(service.pollInterval);
      expect(modelData.set).toHaveBeenCalledTimes(2);
      tick(service.pollInterval);
      expect(modelData.set).toHaveBeenCalledTimes(3);

      // modify result
      serverResult
        .filter((info: UserDatasetInfo) => {
          return info.status === DatasetStatus.IN_PROGRESS;
        })
        .forEach((info: UserDatasetInfo) => {
          info.status = DatasetStatus.COMPLETED;
        });

      // last poll
      tick(service.pollInterval);
      expect(modelData.set).toHaveBeenCalledTimes(4);

      // confirm polling stopped
      tick(service.pollInterval);
      expect(modelData.set).toHaveBeenCalledTimes(4);
      */
    }));

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockUserDatasets)).toBeTruthy();
    });
  });
});
