import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ngx-codemirror',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MockCodemirrorComponent,
      multi: true
    }
  ],
  standalone: false
})
export class MockCodemirrorComponent implements ControlValueAccessor {
  options = {};
  form = {};

  writeValue(): void {
    // unimplemented
  }

  registerOnChange(_: () => void): void {
    // unimplemented
  }

  registerOnTouched(): void {
    // unimplemented
  }

  onChange(): void {
    // unimplemented
  }
}
