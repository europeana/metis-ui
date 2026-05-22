import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UploadComponent } from './upload.component';
import { UploadService } from '../_services';
import { ModalConfirmService } from 'shared';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let mockUploadService: any;
  let mockModalService: any;

  beforeEach(async () => {
    mockUploadService = {
      getCountries: vi.fn().mockReturnValue(of([{ code: 'NL', name: 'Netherlands' }])),
      getLanguages: vi.fn().mockReturnValue(of([{ code: 'nl', name: 'Dutch' }])),
      submitDataset: vi.fn().mockReturnValue(of({ body: { 'dataset-id': '12345' } }))
    };

    mockModalService = {
      open: vi.fn().mockReturnValue(of(true)),
      add: vi.fn() // Keeps child component template initialization safe
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: mockUploadService },
        { provide: ModalConfirmService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and populate dropdown values cleanly', async () => {
    fixture.detectChanges();
    // Flush the async Promise queue first, then synchronize the signal graph
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.flushEffects();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([{ code: 'NL', name: 'Netherlands' }]);
    expect(component.languages.value()).toEqual([{ code: 'nl', name: 'Dutch' }]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow pre-login authentication failures with safe empty arrays', async () => {
    const mock401Error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock401Error));
    mockUploadService.getLanguages.mockReturnValue(throwError(() => mock401Error));

    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.flushEffects();

    expect(component.countries.status()).toBe('resolved'); // Returns fallback empty array, so it resolves
    expect(component.countries.value()).toEqual([]);
    expect(component.languages.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow cut network redirect connections (status 0) safely', async () => {
    const mockStatusZeroError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mockStatusZeroError));

    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.flushEffects();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should rethrow standard application server runtime failures directly', async () => {
    const mock500Error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Failed to populate countries configuration list'
    });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock500Error));

    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.flushEffects();

    // Verify correct string literal status and presence of error payload
    expect(component.countries.status()).toBe('error');
    expect(component.countries.error()).toBeDefined();
  });
});
