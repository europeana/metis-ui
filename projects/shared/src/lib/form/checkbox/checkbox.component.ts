import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormGroup } from '@angular/forms';

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
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() form: UntypedFormGroup;
  @Input() labelText: string;
  @Input() controlName: string;
  @Input() disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any = (): void => {
    // unimplemented
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTouch: any = (): void => {
    // unimplemented
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInputChange(_: any): void {
    this.onChange();
  }

  writeValue(): void {
    // unimplemented
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
    // unimplemented
  }

  /** onKeyToggle
   * toggles the form value / triggers change handler
   * @param { Event: event }
   **/
  onKeyToggle(event: Event): void {
    const ctrl = this.form.controls[this.controlName];
    ctrl.setValue(!ctrl.value);
    event.preventDefault();
    this.onChange();
  }
}
