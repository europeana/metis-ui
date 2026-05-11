import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';

import { mockedKeycloak, MockHttp, provideKeycloakMock } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { mockUserDatasets } from '../_mocked';
import { DropInModel } from '../_models';
import { UserDataService } from './';

describe('UserDataService', () => {
  let mockHttp: MockHttp;
  let service: UserDataService;
  let keycloakMock: Keycloak;

  const dataUrl = `${apiSettings.apiHost}/users/me/datasets`;

  const configureTestbed = (): void => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
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
    service = TestBed.inject(UserDataService);
    keycloakMock = TestBed.inject(Keycloak);
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), '');
  };

  afterAll(() => {
    vi.useRealTimers();
  });

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

    it('should get the user datasets', () => {
      keycloakMock.authenticated = false;

      service.getUserDatsets().subscribe((res) => {
        expect(res.length).toBeFalsy();
      });
      vi.advanceTimersByTime(0);

      keycloakMock.authenticated = true;

      service.getUserDatsets().subscribe((res) => {
        expect(res.length).toBeTruthy();
      });
      vi.advanceTimersByTime(0);

      mockHttp.expect('GET', dataUrl).send(mockUserDatasets);

      service.getUserDatsets().subscribe((res) => {
        expect(res.length).toBeTruthy();
      });
      vi.advanceTimersByTime(0);
      mockHttp.expect('GET', dataUrl).send(mockUserDatasets.reverse());
    });

    it('should unsub', () => {
      mockedKeycloak.authenticated = true;

      const spy = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.subs = [{ unsubscribe: spy } as any];

      service.refreshUserDatsetPoller();
      vi.advanceTimersByTime(1);
      mockHttp.expect('GET', dataUrl).send(mockUserDatasets);
      expect(spy).toHaveBeenCalled();
    });

    it('should refresh the user-datset poller on login', () => {
      vi.spyOn(service, 'refreshUserDatsetPoller');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.AuthLogout);

      const testObject = (keycloakMock as unknown) as {
        authenticatedSignal: { set: (_: boolean) => void };
      };

      testObject.authenticatedSignal.set(true);
      vi.advanceTimersByTime(1);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.Ready);
      expect(service.refreshUserDatsetPoller).toHaveBeenCalled();
    });

    it('should only update the signal when the dataset actually changes', async () => {
      mockedKeycloak.authenticated = true;
      const initialData = [...mockUserDatasets];
      const sameData = [...mockUserDatasets]; // Identical content
      const changedData = [...mockUserDatasets, { id: 'new-id' } as any];

      const setSpy = vi.spyOn(service.signalUserDatasetModel, 'set');
      service.refreshUserDatsetPoller();

      // --- 1. INITIAL POLL ---
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve(); // Flush to reach HttpClient
      mockHttp.expect('GET', dataUrl).send(initialData);
      await Promise.resolve(); // Flush to reach Signal.set()

      expect(setSpy).toHaveBeenCalledTimes(1);

      // --- 2. SECOND POLL (SAME DATA) ---
      await vi.advanceTimersByTimeAsync(service.pollInterval + 1);
      await Promise.resolve();
      mockHttp.expect('GET', dataUrl).send(sameData);
      await Promise.resolve();

      // If your service uses distinctUntilChanged, this remains 1.
      // If it doesn't, it will be 2.
      expect(setSpy).toHaveBeenCalledTimes(1);

      // --- 3. THIRD POLL (CHANGED DATA) ---
      await vi.advanceTimersByTimeAsync(service.pollInterval + 1);
      await Promise.resolve();
      mockHttp.expect('GET', dataUrl).send(changedData);
      await Promise.resolve();

      expect(setSpy).toHaveBeenCalledTimes(2);
    });

    // temporarily disable status-related testing
    /*
      serverResult
        .filter((info: UserDatasetInfo) => {
          return info.status === DatasetStatus.IN_PROGRESS;
        })
        .forEach((info: UserDatasetInfo) => {
          info.status = DatasetStatus.COMPLETED;
        });

      vi.advanceTimersByTime(service.pollInterval);
      mockHttp.expect('GET', dataUrl).send(serverResult);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(1);

      // last poll
      vi.advanceTimersByTime(service.pollInterval);
      mockHttp.expect('GET', dataUrl).send([...serverResult, ...serverResult.reverse()]);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(2);

      // confirm polling stopped
      vi.advanceTimersByTime(service.pollInterval);
      expect(service.signalUserDatasetModel.set).toHaveBeenCalledTimes(2);
      */

    it('should prepend to the UserDatset model', () => {
      let arr: Array<DropInModel> = service.signalUserDatasetModel();
      expect(arr.length).toEqual(0);

      service.prependUserDatset('1');

      arr = service.signalUserDatasetModel();
      expect(arr.length).toEqual(1);

      service.prependUserDatset('0');
      arr = service.signalUserDatasetModel();

      expect(arr.length).toEqual(2);

      expect(arr[0].id.value).toEqual('0');
      expect(arr[1].id.value).toEqual('1');
    });

    it('should mapToDropIn', () => {
      expect(service.mapToDropIn(mockUserDatasets)).toBeTruthy();
    });
  });
});
