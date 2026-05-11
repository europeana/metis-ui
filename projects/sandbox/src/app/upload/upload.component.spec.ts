import { Component, Input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest';

import { ModalConfirmComponent, ModalConfirmService, ProtocolType } from 'shared';
import { UploadService } from '../_services';
import { UploadComponent } from './upload.component';

@Component({
  selector: 'lib-modal',
  standalone: true,
  template: ''
})
class MockModalConfirmComponent {
  @Input() id: string;
  @Input() title: string;
  @Input() isSmall: boolean;
  @Input() buttons: any[];
}

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let uploadServiceMock: Mocked<UploadService>;

  const fillUploadForm = (comp: UploadComponent) => {
    const f = comp.form();
    f.get('name')?.setValue('A'); // No whitespace allowed
    f.get('country')?.setValue('NL');
    f.get('language')?.setValue('en');
    f.get('stepSize')?.setValue(1);
    f.get('uploadProtocol')?.setValue(ProtocolType.HTTP_HARVEST);
    f.get('url')?.setValue('http://test.com');
    f.get('sendXSLT')?.setValue(false);

    comp.updateConditionalXSLValidator();
    f.updateValueAndValidity();
  };

  beforeEach(async () => {
    uploadServiceMock = {
      getCountries: vi.fn().mockReturnValue(of([])),
      getLanguages: vi.fn().mockReturnValue(of([])),
      submitDataset: vi.fn().mockReturnValue(of({ 'dataset-id': '123' }))
    } as any;

    await TestBed.configureTestingModule({
      imports: [UploadComponent, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: uploadServiceMock },
        {
          provide: ModalConfirmService,
          useValue: {
            open: vi.fn().mockReturnValue(of(true)),
            remove: vi.fn()
          }
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(UploadComponent, {
        remove: { imports: [ModalConfirmComponent] },
        add: { imports: [MockModalConfirmComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should initialize countries resource', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countries.value()).toEqual([]);
  });

  it('should reset error when form values change', async () => {
    component.error.set({ status: 500 } as any);
    component
      .form()
      .get('name')
      ?.setValue('B');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.error()).toBeUndefined();
  });

  it('should emit notifyBusy and call service on submit', async () => {
    const busySpy = vi.spyOn(component.notifyBusy, 'emit');
    fillUploadForm(component);

    expect(component.form().valid).toBe(true);

    component.onSubmitDataset();
    await fixture.whenStable();

    expect(busySpy).toHaveBeenCalledWith(true);
    expect(uploadServiceMock.submitDataset).toHaveBeenCalled();
  });

  it('should clear form fields on rebuildForm', async () => {
    component.error.set({ status: 400 } as any);
    component.rebuildForm();
    fixture.detectChanges();
    expect(component.error()).toBeUndefined();
  });
});
