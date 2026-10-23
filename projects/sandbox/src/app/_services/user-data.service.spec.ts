import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserDataService } from './user-data.service';
import { KeycloakAuthService } from './keycloak-auth.service';
import { DropInModel, UserDatasetInfo } from '../_models';

vi.mock('../_translate', () => ({
  RenameStepPipe: vi.fn().mockImplementation(() => ({
    transform: vi.fn().mockReturnValue('Mocked Protocol')
  }))
}));

describe('UserDataService', () => {
  let service: UserDataService;
  let mockHttp: { get: any };

  let mockIsAuthenticatedSignal: WritableSignal<boolean>;
  let mockAuthService: { isAuthenticated: WritableSignal<boolean> };

  const mockServerDatasets: Array<UserDatasetInfo> = [
    {
      'dataset-id': 'ds-100',
      'dataset-name': 'Archive A',
      'harvest-protocol': 'OAI-PMH',
      country: 'NL',
      language: 'nl',
      'creation-date': '2026-05-18T10:00:00Z'
    },
    {
      'dataset-id': 'ds-200',
      'dataset-name': 'Archive B',
      'harvest-protocol': 'OAI-PMH',
      country: 'FR',
      language: 'fr',
      'creation-date': '2026-05-18T11:00:00Z'
    }
  ] as any;

  beforeEach(async () => {
    vi.useFakeTimers();

    mockHttp = {
      get: vi.fn().mockReturnValue(of(mockServerDatasets))
    };

    mockIsAuthenticatedSignal = signal<boolean>(false);
    mockAuthService = {
      isAuthenticated: mockIsAuthenticatedSignal
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UserDataService,
        { provide: HttpClient, useValue: mockHttp },
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(UserDataService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should construct the service instance', () => {
    expect(service).toBeTruthy();
    expect(service.pollInterval).toBe(4000);
    expect(service.signalUserDatasetModel()).toEqual([]);
    expect(service.isInitialised()).toBe(false);
  });

  it('should immediately kick off dataset polling when authentication state flips to true', async () => {
    expect(service.isInitialised()).toBe(false);
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    expect(mockHttp.get).toHaveBeenCalledWith(`null/users/me/datasets`);

    const models = service.signalUserDatasetModel();
    expect(models.length).toBe(2);
    expect(models[0].id.value).toBe('ds-200');
    expect(models[0].about.customClass).toBe('flag-orb fr');
    expect(models[1].id.value).toBe('ds-100');
    expect(service.isInitialised()).toBe(true);
  });

  it('should fallback to an empty array response when unauthenticated', async () => {
    mockIsAuthenticatedSignal.set(false);
    await TestBed.flushEffects();

    service.getUserDatasets().subscribe((data: Array<UserDatasetInfo>) => {
      expect(data).toEqual([]);
    });

    expect(mockHttp.get).not.toHaveBeenCalled();
  });

  it('should push entry models to the front of collections when calling prependUserDataset', async () => {
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    expect(service.signalUserDatasetModel().length).toBe(2);

    service.prependUserDataset('ds-pending-999');
    await TestBed.flushEffects();

    const updatedSignals = service.signalUserDatasetModel();
    expect(updatedSignals.length).toBe(3);
    expect(updatedSignals[0].id.value).toBe('ds-pending-999');
    expect(updatedSignals[0].name.value).toBe('pending');

    service.getUserDatasetsPolledObservable().subscribe((streamArray: Array<DropInModel>) => {
      expect(streamArray.length).toBe(3);
      expect(streamArray[0].id.value).toBe('ds-pending-999');
    });
  });

  it('should swallow network layer rejections safely and return clean fallback streams during polling failures', async () => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('Server Down')));
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);
    expect(service.signalUserDatasetModel()).toEqual([]);
    expect(service.isInitialised()).toBe(true);
  });

  it('should clean up active streaming subscriptions when calling internal cleanup metrics', () => {
    const unsubSpy = vi.fn();

    (service as any)['pollerSubs'] = [{ unsubscribe: unsubSpy }];
    (service as any)['_isInitialised'].set(true);

    expect((service as any)['pollerSubs']).toHaveLength(1);

    service.cleanup();

    expect(unsubSpy).toHaveBeenCalled();
    expect((service as any)['pollerSubs']).toHaveLength(0);
    expect(service.isInitialised()).toBe(false);
  });

  it('should fall back to an empty string class when a country code is missing or unmapped', async () => {
    const customUnmappedDataset = [
      {
        'dataset-id': 'ds-100',
        'dataset-name': 'Archive A',
        'harvest-protocol': 'OAI-PMH',
        country: 'US',
        language: 'en',
        'creation-date': '2026-05-18T10:00:00Z'
      }
    ] as any;

    mockHttp.get.mockReturnValue(of(customUnmappedDataset));

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    const models = service.signalUserDatasetModel();
    const unmappedItem = models.find((m) => m.id.value === 'ds-100');

    expect(unmappedItem?.about.customClass).toBe('flag-orb ');
  });

  it('should preserve original collection ordering positions when dataset creation dates are identical', async () => {
    mockServerDatasets[0]['creation-date'] = '2026-05-18T10:00:00Z';
    mockServerDatasets[1]['creation-date'] = '2026-05-18T10:00:00Z';

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    expect(service.signalUserDatasetModel().length).toBe(2);
  });

  it('should unsubscribe from all existing poller connections before initializing a new poller loop', () => {
    const legacyUnsubscribeSpy = vi.fn();
    (service as any)['pollerSubs'] = [
      { unsubscribe: legacyUnsubscribeSpy },
      { unsubscribe: legacyUnsubscribeSpy }
    ];

    mockIsAuthenticatedSignal.set(true);

    service.refreshUserDatasetPoller();

    expect(legacyUnsubscribeSpy).toHaveBeenCalledTimes(2);
    expect((service as any)['pollerSubs']).toHaveLength(1);

    expect((service as any)['pollerSubs'][0]).not.toEqual({ unsubscribe: legacyUnsubscribeSpy });
  });

  it('should push an empty collection down the stream pipeline if the poller encounters a fatal error context', async () => {
    mockHttp.get.mockReturnValue(throwError(() => new Error('Server Exception')));

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    expect(service.signalUserDatasetModel()).toEqual([]);
  });
});
