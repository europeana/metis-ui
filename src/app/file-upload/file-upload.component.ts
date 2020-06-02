import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  onChange: Function;

  @Input() acceptedTypes: string;
  @Input() form: FormGroup;

  @HostListener('change', ['$event.target.files'])
  emitFiles(event: FileList): void {
    const file = event && event.item(0);
    this.onChange(file);
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  constructor(private host: ElementRef<HTMLInputElement>) {}

  /** writeValue
  /*  clear file input
  */
  writeValue(): void {
    this.host.nativeElement.value = '';
  }

  /** registerOnChange
  /*  assign value-changed function to native file input
  /*  @param {Function} fn - the function to bind to
  */
  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  /** registerOnTouched
  /*  assign touched function to native file input
  /*  @param {Function} fn - the function to bind to
  */
  registerOnTouched() {}
}
