import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
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
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  @Input() acceptedTypes: string;
  @Input() form: UntypedFormGroup;

  @HostListener('change', ['$event.target.files'])
  emitFiles(event: FileList): void {
    const file = event && event.item(0);
    this.onChange(file);
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  constructor(private readonly host: ElementRef<HTMLInputElement>) {}

  /** clearFileValue
  /*  clear file input
  */
  clearFileValue(): void {
    this.fileUpload.nativeElement.value = '';
  }

  /** writeValue
  /*  default implementaion of ControlValueAccessor.writeValue
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
  registerOnTouched(fn: Function): void {
    console.log(!!fn);
  }
}
