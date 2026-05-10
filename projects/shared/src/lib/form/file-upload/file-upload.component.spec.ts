import '@angular/localize/init';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;

    // Provide a mock form group for tests that need it
    fixture.componentRef.setInput('form', new FormGroup({
      testFile: new FormControl(null)
    }));
    fixture.componentRef.setInput('controlName', 'testFile');

    await fixture.whenStable();
  });

  it('should update filename and form control when file is picked', () => {
    const mockFile = new File([''], 'test.zip');
    const event = { target: { files: { item: () => mockFile } } } as any;

    component.emitFiles(event);

    expect(component.selectedFileName()).toBe('test.zip');
    expect(component.form()?.get('testFile')?.value).toBe(mockFile);
  });

  it('should clear value when clearFileValue is called', () => {
    component.selectedFileName.set('some-file.txt');
    component.clearFileValue();
    expect(component.selectedFileName()).toBe('');
    expect(component.form()?.get('testFile')?.value).toBeNull();
  });
});
