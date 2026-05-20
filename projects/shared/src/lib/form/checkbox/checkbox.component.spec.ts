import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent (Zoneless Multi-Interaction Validation)', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
  });

  // =========================================================================
  // REACTIVE FORM IMPLEMENTATION TESTS
  // =========================================================================
  describe('Reactive Form Implementation', () => {
    let parentForm: FormGroup;

    beforeEach(() => {
      parentForm = new FormGroup({
        sendXSLT: new FormControl(false)
      });

      component.form = parentForm;
      component.controlName = 'sendXSLT';
      component.labelText = 'Reactive Option';
    });

    it('should toggle state cleanly when host container label is clicked (Real User)', async () => {
      const emitSpy = vi.spyOn(component.valueChanged, 'emit');
      await fixture.whenStable();

      const labelDebugEl = fixture.debugElement.query(By.css('label.checkbox'));

      // Target text or span inside the label container to simulate standard click
      const spanEl = labelDebugEl.query(By.css('span')).nativeElement;
      labelDebugEl.triggerEventHandler('click', { target: spanEl, preventDefault: vi.fn() });
      await fixture.whenStable();

      expect(parentForm.get('sendXSLT')?.value).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should toggle state once when native input is directly targeted (Cypress Engine)', async () => {
      const emitSpy = vi.spyOn(component.valueChanged, 'emit');
      await fixture.whenStable();

      const inputDebugEl = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      const inputEl = inputDebugEl.nativeElement as HTMLInputElement;

      // Simulate Cypress action: native property flip followed by bubbling change event
      inputEl.checked = true;
      inputDebugEl.triggerEventHandler('change', { target: inputEl });
      await fixture.whenStable();

      expect(parentForm.get('sendXSLT')?.value).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should modify state using spacebar accessibility keys', async () => {
      await fixture.whenStable();

      const labelDebugEl = fixture.debugElement.query(By.css('label.checkbox'));
      const mockEvent = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      labelDebugEl.triggerEventHandler('keydown.space', mockEvent);
      await fixture.whenStable();

      expect(parentForm.get('sendXSLT')?.value).toBe(true);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // NO-FORM (STANDALONE) IMPLEMENTATION TESTS
  // =========================================================================
  describe('No-Form Implementation', () => {
    beforeEach(() => {
      //component.form = undefined;
      component.labelText = 'Standalone Checkbox';
      component.checked = false;
      component.disabled = false;
    });

    it('should mutate checkbox model state via native input manipulation cascades', async () => {
      const emitSpy = vi.spyOn(component.valueChanged, 'emit');
      await fixture.whenStable();

      const inputDebugEl = fixture.debugElement.query(By.css('input[type="checkbox"]'));
      const inputEl = inputDebugEl.nativeElement as HTMLInputElement;

      inputEl.checked = true;
      inputDebugEl.triggerEventHandler('change', { target: inputEl });
      await fixture.whenStable();

      expect(component.checked).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });
  });
});
