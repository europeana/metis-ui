import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import Keycloak from 'keycloak-js';
import { mockedKeycloak } from 'shared';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';

import { MockHttp } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { mockUserDatasets } from '../_mocked';
import { DatasetStatus, UserDatasetInfo } from '../_models';
import { DropInService } from '../_services';

describe('DropInService', () => {
  let mockHttp: MockHttp;
  let service: DropInService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ({} as unknown) as KeycloakEvent;
          }
        }
      ]
    }).compileComponents();
    service = TestBed.inject(DropInService);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), '');
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should getDatsets', () => {
      mockedKeycloak.authenticated = false;

      let res = service.getUserDatsets();
      expect(res).toBeTruthy();
      res.subscribe((items) => {
        expect(items.length).toBeFalsy();
      });

      mockedKeycloak.authenticated = true;

      const sub = service.getUserDatsets().subscribe((items) => {
        expect(items.length).toBeTruthy();
      });

      const expectedUrl = `${apiSettings.apiHost}/user-datasets`;
      mockHttp.expect('GET', expectedUrl).send([{}]);
      sub.unsubscribe();
      mockedKeycloak.authenticated = false;
    });

    it('should get the user-dataset polled observable', () => {
      expect(service.getUserDatasetsPolledObservable()).toBeTruthy();
    });

    it('should unsub', () => {
      const serverResult = [...mockUserDatasets];
      spyOn(service, 'getUserDatsets').and.callFake(() => {
        return of(serverResult);
      });
      const spy = jasmine.createSpy();
      service.sub = { unsubscribe: spy } as any;
      service.refreshUserDatsetPoller();
      expect(spy).toHaveBeenCalled();
    });

    it('should refresh the user-datset poller', fakeAsync(() => {
      const serverResult = [...mockUserDatasets];
      spyOn(service, 'getUserDatsets').and.callFake(() => {
        return of(serverResult);
      });

      spyOn(service.signal, 'set').and.callThrough();

      service.refreshUserDatsetPoller();

      tick(0);

      expect(service.signal.set).toHaveBeenCalled();
      tick(service.pollInterval);
      expect(service.signal.set).toHaveBeenCalledTimes(2);
      tick(service.pollInterval);
      expect(service.signal.set).toHaveBeenCalledTimes(3);

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
      expect(service.signal.set).toHaveBeenCalledTimes(4);

      // confirm polling stopped
      tick(service.pollInterval);
      expect(service.signal.set).toHaveBeenCalledTimes(4);
    }));

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockUserDatasets)).toBeTruthy();
    });
  });
});
