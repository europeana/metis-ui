import { Component, forwardRef, input, model, output } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'lib-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  // Inputs as Signals
  readonly form = input<FormGroup | undefined>(undefined);
  readonly controlName = input<string | undefined>(undefined);
  readonly labelText = input<string>('');

  // Reactive State
  readonly isChecked = model<boolean>(false);
  readonly disabled = model<boolean>(false);

  // Standalone usage output
  readonly valueChanged = output<boolean>();

  /**
   * CVA Callbacks must be public for template access
   **/

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onChange: (val: boolean) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched: () => void = () => {};

  /**
   * toggle
   * Handles state change from the UI.
   */
  toggle(): void {
    if (this.disabled()) return;

    const newVal = !this.isChecked();
    this.isChecked.set(newVal);

    // 1. Notify standalone listeners
    this.valueChanged.emit(newVal);

    // 2. Notify Form via CVA
    this.onChange(newVal);
    this.onTouched();

    // 3. Manual sync for the [form] input fallback
    const group = this.form();
    const name = this.controlName();
    if (group && name) {
      const control = group.get(name);
      if (control && control.value !== newVal) {
        control.setValue(newVal, { emitEvent: true });
      }
    }
  }

  // --- ControlValueAccessor Implementation ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(value: any): void {
    this.isChecked.set(!!value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
