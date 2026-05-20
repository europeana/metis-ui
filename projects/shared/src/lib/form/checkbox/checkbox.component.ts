import { NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';

@Component({
  selector: 'lib-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  imports: [NgIf, FormsModule, ReactiveFormsModule, NgClass]
})
export class CheckboxComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() form: UntypedFormGroup;
  @Input() labelText: string;
  @Input() controlName: string;
  @Input() disabled = false;

  // non-reactive forms implementation fallbacks
  @Input() attrE2E: string;
  @Input() checked = false;
  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('checkbox') checkbox: ElementRef<HTMLInputElement>;

  onChange: (val: boolean) => void = () => {};
  onTouch: () => void = () => {};

  /**
   * On Input Change (Reactive Form Template Track)
   * Triggered cleanly when the native checkbox updates inside your [formGroup].
   */
  onInputChange(event: Event): void {
    if (this.disabled || (this.form && this.form.disabled)) {
      return;
    }

    const isChecked = (event.target as HTMLInputElement).checked;

    if (this.form && this.controlName) {
      this.form.controls[this.controlName].setValue(isChecked);
    }

    this.onChange(isChecked);
    this.valueChanged.emit(isChecked);
    this.cdr.markForCheck(); // Zoneless design safety
  }

  /**
   * Toggle Engine (No-Form Fallback Template Track)
   * Handles native input interactions for form-less states.
   */
  toggle(): void {
    if (this.disabled) return;

    let isChecked = false;

    if (this.checkbox) {
      // Look up what the browser set on the native element
      isChecked = this.checkbox.nativeElement.checked;
      this.checked = isChecked;
    }

    this.onChange(isChecked);
    this.valueChanged.emit(isChecked);
    this.cdr.markForCheck();
  }

  /**
   * Spacebar Keyboard Accessibility Fixes
   * Simulates a clean checkbox state update from spacebar key presses.
   */
  onKeyToggle(event: Event): void {
    if (this.disabled || (this.form && this.form.disabled)) return;
    event.preventDefault(); // Stop standard browser page-scrolling action

    if (this.form && this.controlName) {
      const ctrl = this.form.controls[this.controlName];
      const nextValue = !ctrl.value;
      ctrl.setValue(nextValue);
      this.onChange(nextValue);
      this.valueChanged.emit(nextValue);
    }
    this.cdr.markForCheck();
  }

  /**
   * Keyboard Trigger for Form-less Implementation
   */
  onNoFormKeyToggle(event: Event): void {
    if (this.disabled) return;
    event.preventDefault();

    this.checked = !this.checked;
    this.onChange(this.checked);
    this.valueChanged.emit(this.checked);
    this.cdr.markForCheck();
  }

  /* --- Control Value Accessor Interfaces --- */

  writeValue(value: boolean): void {
    this.checked = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
