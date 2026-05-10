import { Component, ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  readonly fileUpload = viewChild<ElementRef<HTMLInputElement>>('fileUpload');
  readonly selectedFileName = signal<string>('');

  // --- INPUTS ---
  readonly acceptedTypes = input<string>('');
  readonly form = input<FormGroup>(); // This fixes the NG8002 error
  readonly controlName = input<string>('');

  // CVA State
  onChange: any = () => {};
  onTouched: any = () => {};
  disabled = signal(false);

  emitFiles(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0) ?? null;

    this.selectedFileName.set(file ? file.name : '');
    this.onChange(file);
    this.onTouched();

    // If a form group is provided manually, ensure the control is updated
    const group = this.form();
    const name = this.controlName();
    if (group && name) {
      group.get(name)?.setValue(file);
    }
  }

  clearFileValue(): void {
    this.selectedFileName.set('');
    const nativeInput = this.fileUpload()?.nativeElement;
    if (nativeInput) {
      nativeInput.value = '';
    }
    this.onChange(null);

    const group = this.form();
    const name = this.controlName();
    if (group && name) {
      group.get(name)?.setValue(null);
    }
  }

  writeValue(value: File | null): void {
    this.selectedFileName.set(value ? value.name : '');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
