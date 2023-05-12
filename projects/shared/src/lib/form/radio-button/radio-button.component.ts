import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonComponent),
      multi: true
    }
  ]
})
export class RadioButtonComponent implements ControlValueAccessor {
  @Input() form: FormGroup;
  @Input() controlName = '';
  @Input() disabled = false;
  @Input() label = '';
  @Input() valueName = '';

  value: string;

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
    this.onChange(this.valueName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(_: any): void {
    // unimplemented
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  /** onKeyToggle
   * sets the form field to this instance's value / triggers change handler
   * @param { Event: event }
   **/
  onKeyToggle(event: Event): void {
    event.preventDefault();
    this.form.controls[this.controlName].setValue(this.valueName);
    this.onInputChange(event);
  }
}
