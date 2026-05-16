import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';

import { UserDataService } from './user-data.service';
import { KeycloakAuthService } from './keycloak-auth.service';
import { HarvestType, UserDatasetInfo } from '../_models';

describe('UserDataService', () => {
  let service: UserDataService;
  let httpMock: HttpTestingController;
  let mockAuthService: { isAuthenticated: WritableSignal<boolean> };

  const mockDatasetResponse: Array<UserDatasetInfo> = [
    {
      'dataset-id': 'dataset_1',
      'dataset-name': 'Test Dataset A',
      'harvest-protocol': 'OAI_PMH' as HarvestType,
      'created-by-id': 'user_test_999',
      country: 'NL',
      language: 'nl',
      'creation-date': '2026-05-14T10:00:00Z'
    }
  ];

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: signal(false)
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(UserDataService);
    httpMock = TestBed.inject(HttpTestingController);

    vi.useFakeTimers();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('should be created successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should return an empty list immediately when user is unauthenticated', () => {
    mockAuthService.isAuthenticated.set(false);

    service.getUserDatsets().subscribe((data) => {
      expect(data).toEqual([]);
    });

    httpMock.expectNone((req) => req.url.endsWith('/users/me/datasets'));
  });

  it('should request user datasets from the backend api when authenticated', () => {
    mockAuthService.isAuthenticated.set(true);

    service.getUserDatsets().subscribe((data) => {
      expect(data.length).toBe(1);
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/users/me/datasets'));
    expect(req.request.method).toBe('GET');
    req.flush(mockDatasetResponse);
  });

  it('should prepend a pending data row to the dataset model list', () => {
    expect(service.signalUserDatasetModel().length).toBe(0);

    service.prependUserDatset('pending_id_999');

    const modelState = service.signalUserDatasetModel();
    expect(modelState.length).toBe(1);

    // ✅ Fixed: Access properties cleanly through the first element lookup index bracket [0]
    expect(modelState[0].id?.value).toBe('pending_id_999');
    expect(modelState[0].name?.value).toBe('pending');
  });
});
