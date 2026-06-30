import { Component, ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // 💡 Tip: In modern Angular, forwardRef is often optional, but kept here for structural compatibility
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

  // --- CVA STATE STUBS ---

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: File | null) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  readonly disabled = signal<boolean>(false);

  emitFiles(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0) ?? null;

    this.selectedFileName.set(file ? file.name : '');

    // 🚀 Angular Forms intercepts this call and automatically updates the parent form control state
    this.onChange(file);
    this.onTouched();
  }

  clearFileValue(): void {
    this.selectedFileName.set('');
    const nativeInput = this.fileUpload()?.nativeElement;
    if (nativeInput) {
      nativeInput.value = '';
    }

    // 🚀 Instantly notifies Angular forms that the control value is now empty/null
    this.onChange(null);
    this.onTouched();
  }

  // --- CONTROL VALUE ACCESSOR INTERFACE METHODS ---
  writeValue(value: File | null): void {
    // Intercepts programmatically injected form values (e.g. patchValue or initial values)
    this.selectedFileName.set(value ? value.name : '');

    // If the value was reset programmatically, make sure the HTML element is cleared too
    const nativeInput = this.fileUpload()?.nativeElement;
    if (!value && nativeInput) {
      nativeInput.value = '';
    }
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
