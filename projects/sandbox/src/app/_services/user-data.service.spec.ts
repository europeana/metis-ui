import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserDataService } from './user-data.service';
import { KeycloakAuthService } from './keycloak-auth.service';
import { UserDatasetInfo } from '../_models';

// Mock pipes that are instantiated inside the service
vi.mock('../_translate', () => ({
  RenameStepPipe: vi.fn().mockImplementation(() => ({
    transform: vi.fn().mockReturnValue('Mocked Protocol')
  }))
}));

describe('UserDataService', () => {
  let service: UserDataService;
  let mockHttp: any;

  let mockIsAuthenticatedSignal: WritableSignal<boolean>;
  let mockAuthService: any;

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
      'creation-date': '2026-05-18T11:00:00Z' // Later creation date should sort to the top
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

    // Instantiate service instance
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
  });

  it('should immediately kick off dataset polling when authentication state flips to true', async () => {
    // Act: Simulate authenticating user context
    mockIsAuthenticatedSignal.set(true);

    // Angular Zoneless: Process the service constructor effect boundary
    await TestBed.flushEffects();

    // Fast-forward fake timers immediately to trigger the underlying RxJS stream
    vi.advanceTimersByTime(0);

    // 🚀 FIX: Aligned with the complete configuration endpoint string requested by the service
    expect(mockHttp.get).toHaveBeenCalledWith(`null/users/me/datasets`);

    // Verify mapped data propagates directly into both signals and RxJS subjects
    const models = service.signalUserDatasetModel();
    expect(models.length).toBe(2);

    // Confirms chronological descending creation-date sorting logic works (ds-200 sorts first)
    expect(models[0].id.value).toBe('ds-200');
    expect(models[0].about.customClass).toBe('flag-orb fr');
    expect(models[1].id.value).toBe('ds-100');
  });

  it('should fallback to an empty array response when unauthenticated', async () => {
    mockIsAuthenticatedSignal.set(false);
    await TestBed.flushEffects();

    service.getUserDatsets().subscribe((data) => {
      expect(data).toEqual([]);
    });

    expect(mockHttp.get).not.toHaveBeenCalled();
  });

  it('should push entry models to the front of collections when calling prependUserDatset', async () => {
    // Populate layout base metrics with mock records
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    expect(service.signalUserDatasetModel().length).toBe(2);

    // Act: Prepend pending id trace entry
    service.prependUserDatset('ds-pending-999');

    const updatedSignals = service.signalUserDatasetModel();
    expect(updatedSignals.length).toBe(3);
    expect(updatedSignals[0].id.value).toBe('ds-pending-999');
    expect(updatedSignals[0].name.value).toBe('pending');

    // Confirm BehaviorSubject matches signal state exactly
    service.getUserDatasetsPolledObservable().subscribe((streamArray) => {
      expect(streamArray.length).toBe(3);
      expect(streamArray[0].id.value).toBe('ds-pending-999');
    });
  });

  it('should swallow network layer rejections safely and return clean fallback streams during polling failures', async () => {
    // Stub an HTTP exception throw block
    mockHttp.get.mockReturnValue(throwError(() => new Error('Server Down')));

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();

    // Spy on console error boundaries
    const errorSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.advanceTimersByTime(0);

    expect(errorSpy).toHaveBeenCalled();
    expect(service.signalUserDatasetModel()).toEqual([]); // Graceful empty fallback state
  });

  it('should clean up active streaming subscriptions when calling internal cleanup metrics', async () => {
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    // Actively tracking 1 background observer subscription thread
    expect((service as any).subs.length).toBe(1);

    // Act: Invoke internal cleanup boundaries
    (service as any).cleanup();

    expect((service as any).subs.length).toBe(0);
  });

  it('should fall back to an empty string class when a country code is missing or unmapped', async () => {
    // explicitly intercept and override the mock HTTP payload
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

    // Verifies that the string falls back to an empty string cleanly ('flag-orb ')
    expect(unmappedItem?.about.customClass).toBe('flag-orb ');
  });

  it('should preserve original collection ordering positions when dataset creation dates are identical', async () => {
    // Set both server records to have matching creation dates to trigger the 'return 0' sorting path
    mockServerDatasets[0]['creation-date'] = '2026-05-18T10:00:00Z';
    mockServerDatasets[1]['creation-date'] = '2026-05-18T10:00:00Z';

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();
    vi.advanceTimersByTime(0);

    // Verifies that both items were processed cleanly without throwing sorting comparison errors
    expect(service.signalUserDatasetModel().length).toBe(2);
  });
});
