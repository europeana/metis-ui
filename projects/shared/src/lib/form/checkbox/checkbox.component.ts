import { NgClass, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
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
  @Input() form: UntypedFormGroup;
  @Input() labelText: string;
  @Input() controlName: string;
  @Input() disabled = false;

  // non reactive forms implementation
  @Input() attrE2E: string;
  @Input() checked = false;
  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('checkbox') checkbox: ElementRef;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any = (): void => {
    this.valueChanged.emit();
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
   * toggles the form value / triggers change handler for reactive forms
   * @param { Event: event }
   **/
  onKeyToggle(event: Event): void {
    const ctrl = this.form.controls[this.controlName];
    ctrl.setValue(!ctrl.value);
    event.preventDefault();
    this.onChange();
  }

  /** toggle
   * optionally updates input and calls valueChanged.emit
   * @param { boolean: updateInput }
   **/
  toggle(updateInput = false): void {
    if (updateInput) {
      this.checkbox.nativeElement.checked = !this.checkbox.nativeElement.checked;
    }
    this.valueChanged.emit(this.checkbox.nativeElement.checked);
  }
}
