import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

import { UploadComponent } from './upload.component';
import { UploadService } from '../_services';
import { ModalConfirmService } from 'shared';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let mockUploadService: any;
  let mockModalService: any;

  beforeEach(async () => {
    // 1. Stub the underlying data services with spy methods
    mockUploadService = {
      getCountries: vi.fn().mockReturnValue(of([{ code: 'NL', name: 'Netherlands' }])),
      getLanguages: vi.fn().mockReturnValue(of([{ code: 'nl', name: 'Dutch' }])),
      submitDataset: vi.fn().mockReturnValue(of({ body: { 'dataset-id': '12345' } }))
    };

    mockModalService = {
      open: vi.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        // 2. Core Zoneless Provider configuration
        provideExperimentalZonelessChangeDetection(),
        { provide: UploadService, useValue: mockUploadService },
        { provide: ModalConfirmService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and populate dropdown values cleanly', async () => {
    // Trigger initial resource signal cycles
    fixture.detectChanges();
    await fixture.whenStable();

    // 3. Assert reactive resource value resolution fields
    expect(component.countries.value()).toEqual([{ code: 'NL', name: 'Netherlands' }]);
    expect(component.languages.value()).toEqual([{ code: 'nl', name: 'Dutch' }]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow pre-login authentication failures with safe empty arrays', async () => {
    // 4. Force service to throw a 401 Unauthorized block
    const mock401Error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock401Error));
    mockUploadService.getLanguages.mockReturnValue(throwError(() => mock401Error));

    fixture.detectChanges();
    await fixture.whenStable();

    // 5. Verify the error-gating fallback rules work perfectly
    expect(component.countries.value()).toEqual([]);
    expect(component.languages.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined(); // Should not register a fatal crash state
  });

  it('should swallow cut network redirect connections (status 0) safely', async () => {
    // 6. Force service to simulate a dropped connection during a Keycloak redirect path
    const mockStatusZeroError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mockStatusZeroError));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.countries.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should rethrow standard application server runtime failures directly', async () => {
    // 7. Test that normal 500 internal server bugs are not swallowed accidentally
    const mock500Error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock500Error));

    fixture.detectChanges();
    await fixture.whenStable();

    // The resource should reflect an active exception state for normal errors
    expect(component.countries.error()).toBeDefined();
  });
});
