import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';

import { mockedKeycloak, MockHttp, provideKeycloakMock } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { mockUserDatasets } from '../_mocked';
import { DatasetStatus, UserDatasetInfo } from '../_models';
import { DropInService } from '../_services';

describe('DropInService', () => {
  let mockHttp: MockHttp;
  let service: DropInService;
  let keycloakMock: Keycloak;

  const dataUrl = `${apiSettings.apiHost}/user-datasets`;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideKeycloakMock({} as any),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return { type: KeycloakEventType.Ready } as KeycloakEvent;
          }
        }
      ]
    }).compileComponents();
    service = TestBed.inject(DropInService);
    keycloakMock = TestBed.inject(Keycloak);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), '');
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should get the user-dataset polled observable', () => {
      expect(service.getUserDatasetsPolledObservable()).toBeTruthy();
    });

    it('should unsub', fakeAsync(() => {
      mockedKeycloak.authenticated = true;

      const spy = jasmine.createSpy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.subs = [{ unsubscribe: spy } as any];

      service.refreshUserDatsetPoller();
      tick();
      mockHttp.expect('GET', dataUrl).send(mockUserDatasets);
      expect(spy).toHaveBeenCalled();
    }));

    it('should refresh the user-datset poller on login', fakeAsync(() => {
      spyOn(service, 'refreshUserDatsetPoller');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.AuthLogout);

      const testObject = (keycloakMock as unknown) as {
        authenticatedSignal: { set: (_: boolean) => void };
      };

      testObject.authenticatedSignal.set(true);
      TestBed.flushEffects();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.Ready);
      tick();
      expect(service.refreshUserDatsetPoller).toHaveBeenCalled();
    }));

    it('should refresh the user-datset poller', fakeAsync(() => {
      mockedKeycloak.authenticated = true;
      const serverResult = [...mockUserDatasets];

      spyOn(service.signalUserDatasetModel, 'set').and.callThrough();
      service.refreshUserDatsetPoller();

      tick(0);
      mockHttp.expect('GET', dataUrl).send(serverResult);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalled();

      tick(service.pollInterval);
      mockHttp.expect('GET', dataUrl).send(serverResult);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(2);

      tick(service.pollInterval);
      mockHttp.expect('GET', dataUrl).send(serverResult);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(3);

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
      mockHttp.expect('GET', dataUrl).send(serverResult);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(4);

      // confirm polling stopped
      tick(service.pollInterval);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(4);

      mockHttp.verify();
    }));

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockUserDatasets)).toBeTruthy();
    });
  });
});
