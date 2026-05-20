import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core'; // 🚀 Added
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CheckboxComponent } from './checkbox.component';

@Component({
  template: `
    <!-- 🚀 Wrapped in a container div to stabilize zoneless tracking paths -->
    <div>
      @if (useForm) {
      <lib-checkbox [form]="formGroup" controlName="myCheck" labelText="Form Checkbox">
      </lib-checkbox>
      } @else {
      <lib-checkbox
        [checked]="checkedFallback"
        labelText="Formless Checkbox"
        attrE2E="test-checkbox"
        (valueChanged)="onValueChanged($event)"
      >
      </lib-checkbox>
      }
    </div>
  `,
  imports: [CheckboxComponent, ReactiveFormsModule]
})
class TestHostComponent {
  useForm = true;
  checkedFallback = false;
  formGroup = new FormGroup({
    myCheck: new FormControl(false)
  });
  onValueChanged = vi.fn();
}

describe('CheckboxComponent (Angular 20 + Zoneless)', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()] // 🚀 Matches your exact app setup
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;

    // Allow the original state to resolve completely
    await fixture.whenStable();
  });

  describe('Reactive Form Implementation Track', () => {
    it('should initialize with value matching form control state', async () => {
      hostComponent.useForm = true;
      await fixture.whenStable(); // 🚀 Wait for zoneless template block compilation

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.checked).toBe(false);

      hostComponent.formGroup.controls.myCheck.setValue(true);
      await fixture.whenStable();
      expect(input.checked).toBe(true);
    });

    it('should update form control value when native checkbox changes state', async () => {
      hostComponent.useForm = true;
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      // Simulating a real click event mutates both checked state and dispatches changes
      input.click();
      await fixture.whenStable();

      expect(hostComponent.formGroup.controls.myCheck.value).toBe(true);
    });

    it('should update form control via keyboard accessibility space event', async () => {
      hostComponent.useForm = true;
      await fixture.whenStable();

      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
      label.dispatchEvent(spaceEvent);
      await fixture.whenStable();

      expect(hostComponent.formGroup.controls.myCheck.value).toBe(true);
    });

    it('should restrict value selection shifts when form or element state is disabled', async () => {
      hostComponent.useForm = true;
      await fixture.whenStable();

      hostComponent.formGroup.controls.myCheck.disable();
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      // 🚀 FIX: Simulate a user click. The browser natively ignores clicks on disabled inputs,
      // confirming your component block restricts value shifts accurately.
      input.click();
      await fixture.whenStable();

      expect(hostComponent.formGroup.controls.myCheck.value).toBe(false);
    });
  });

  describe('Form-less / Fallback Implementation Track', () => {
    it('should populate selection tags correctly via plain input bindings', async () => {
      // 🚀 FIX: Update structural state switches asynchronously to avoid NG0100 check errors
      hostComponent.useForm = false;
      await fixture.whenStable();

      hostComponent.checkedFallback = true;
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.checked).toBe(true);
    });

    it('should dispatch explicit valueChanged events when clicked natively', async () => {
      hostComponent.useForm = false;
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      input.click();
      await fixture.whenStable();

      expect(hostComponent.onValueChanged).toHaveBeenCalledWith(true);
    });

    it('should update state cleanly on spacebar input without crashing parent layout', async () => {
      hostComponent.useForm = false;
      await fixture.whenStable();

      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
      label.dispatchEvent(spaceEvent);
      await fixture.whenStable();

      expect(hostComponent.onValueChanged).toHaveBeenCalledWith(true);
    });
  });
});
