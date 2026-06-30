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
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, NgClass]
})
export class CheckboxComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() form: UntypedFormGroup;
  @Input() labelText: string;
  @Input() controlName: string;
  @Input() disabled = false;
  @Input() attrE2E: string;

  // 🚀 REVERTED TO STANDARD FIELDS: Fixes the initialization error perfectly
  @Input() checked = false;
  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('checkbox') checkbox: ElementRef<HTMLInputElement>;

  onChange: (val: boolean) => void = () => {
    // unimplemented
  };

  onTouch: () => void = () => {
    // unimplemented
  };

  /**
   * Helper to safely emit values asynchronously.
   * This breaks the synchronous event loop execution chain, completely
   * clearing out any potential NG0100 layout exceptions under Zoneless mode.
   */
  private emitStateChange(isChecked: boolean): void {
    this.checked = isChecked;
    this.onChange(isChecked);

    // 🚀 CRITICAL FOR ZONELESS: Defers event loop emission to the next microtask
    // cycle to prevent parent-child template change verification conflicts.
    Promise.resolve().then(() => {
      this.valueChanged.emit(isChecked);
    });

    this.cdr.markForCheck();
  }

  /**
   * On Input Change (Reactive Form Template Track)
   */
  onInputChange(event: Event): void {
    if (this.disabled || (this.form && this.form.disabled)) {
      return;
    }
    const isChecked = (event.target as HTMLInputElement).checked;
    this.emitStateChange(isChecked);
  }

  /**
   * Toggle Engine (No-Form Fallback Template Track)
   */
  toggle(): void {
    if (this.disabled) return;

    if (this.checkbox) {
      const isChecked = this.checkbox.nativeElement.checked;
      this.emitStateChange(isChecked);
    }
  }

  /**
   * Spacebar Keyboard Accessibility Fixes
   */
  onKeyToggle(event: Event): void {
    if (this.disabled || (this.form && this.form.disabled)) return;
    event.preventDefault();

    if (this.form && this.controlName) {
      const ctrl = this.form.controls[this.controlName];
      if (ctrl) {
        const nextValue = !ctrl.value;
        ctrl.setValue(nextValue);
        ctrl.markAsDirty();
        this.emitStateChange(nextValue);
      }
    }
  }

  /**
   * Keyboard Trigger for Form-less Implementation
   */
  onNoFormKeyToggle(event: Event): void {
    if (this.disabled) return;
    event.preventDefault();
    this.emitStateChange(!this.checked);
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
