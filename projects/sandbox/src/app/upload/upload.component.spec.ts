import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UploadComponent } from './upload.component';
import { SandboxConfService, UploadService } from '../_services';
import { ModalConfirmService, ProtocolType } from 'shared';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let mockUploadService: any;
  let mockModalService: any;
  let mockSandboxConfService: any;

  beforeEach(async () => {
    mockUploadService = {
      getCountries: vi.fn().mockReturnValue(of([{ code: 'NL', name: 'Netherlands' }])),
      getLanguages: vi.fn().mockReturnValue(of([{ code: 'nl', name: 'Dutch' }])),
      submitDataset: vi.fn().mockReturnValue(of({ body: { 'dataset-id': '12345' } }))
    };

    mockModalService = {
      open: vi.fn().mockReturnValue(of(true)),
      add: vi.fn()
    };

    mockSandboxConfService = {
      navConf: vi.fn().mockReturnValue([{ error: undefined }, { error: undefined }]),
      updateStepStatus: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: mockUploadService },
        { provide: ModalConfirmService, useValue: mockModalService },
        { provide: SandboxConfService, useValue: mockSandboxConfService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and populate dropdown values cleanly', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

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
    await fixture.whenStable();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([]);
    expect(component.languages.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow cut network redirect connections (status 0) safely', async () => {
    const mockStatusZeroError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mockStatusZeroError));

    fixture.detectChanges();
    await fixture.whenStable();

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
    await fixture.whenStable();

    expect(component.countries.status()).toBe('error');
    expect(component.countries.error()).toBeDefined();
  });

  // ==========================================
  // 🚀 REACTION TEST COVERAGE PATHWAYS
  // ==========================================

  it('should notify outputs and change status state cleanly on successful submissions', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const mockBlobFile = new File([''], 'test-dataset.zip', { type: 'application/zip' });

    component.form().patchValue({
      name: 'TestSandboxDataset', // 🚀 FIXED: Removed whitespace to satisfy name validation rules
      country: 'NL',
      language: 'nl',
      uploadProtocol: ProtocolType.ZIP_UPLOAD,
      url: 'http://localhost:3000/mock-harvest',
      harvestUrl: 'http://localhost:3000/mock-harvest',
      stepSize: '1',
      dataset: mockBlobFile
    });

    const outputSpy = vi.spyOn(component.notifySubmitted, 'emit');

    component.onSubmitDataset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockUploadService.submitDataset).toHaveBeenCalled();
    expect(outputSpy).toHaveBeenCalledWith('12345');
  });

  it('should keep the error state active and unlock the form when an upload fails with a 404 error', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const mock404Error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    mockUploadService.submitDataset.mockReturnValue(throwError(() => mock404Error));

    const mockBlobFile = new File([''], 'failing-dataset.zip', { type: 'application/zip' });

    component.form().patchValue({
      name: 'FailingSandboxDataset', // 🚀 FIXED: Removed whitespace to satisfy name validation rules
      country: 'NL',
      language: 'nl',
      uploadProtocol: ProtocolType.ZIP_UPLOAD,
      url: 'http://localhost:3000/fail-harvest',
      harvestUrl: 'http://localhost:3000/fail-harvest',
      stepSize: '1',
      dataset: mockBlobFile
    });

    mockSandboxConfService.updateStepStatus.mockClear();

    component.onSubmitDataset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form().disabled).toBe(false);

    expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ error: mock404Error })
    );
  });
});
