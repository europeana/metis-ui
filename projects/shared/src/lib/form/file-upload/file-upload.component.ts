import { Component, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  ControlValueAccessor,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ],
  imports: [NgClass, FormsModule, ReactiveFormsModule]
})
export class FileUploadComponent implements ControlValueAccessor {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onChange: Function;
  selectedFileName = '';

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  @Input() acceptedTypes: string;
  @Input() form: FormGroup;

  @HostListener('change', ['$event.target.files'])
  emitFiles(event: FileList): void {
    const file = event && event.item(0);
    this.onChange(file);
    if (file) {
      this.selectedFileName = file.name;
    } else {
      this.selectedFileName = '';
    }
  }

  private readonly host: ElementRef<HTMLInputElement>;

  constructor() {
    this.host = inject(ElementRef);
  }

  /** clearFileValue
  /*  clear file input
  */
  clearFileValue(): void {
    this.fileUpload.nativeElement.value = '';
    this.selectedFileName = '';
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  /** registerOnTouched
  /*  assign touched function to native file input
  /*  @param {Function} fn - the function to bind to
  */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  registerOnTouched(fn: Function): void {
    console.log(!!fn);
  }
}
