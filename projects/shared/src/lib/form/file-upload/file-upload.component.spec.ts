import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FileUploadComponent],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;

    component.form = formBuilder.group({
      depublicationFile: null
    });

    fixture.detectChanges();
  });

  it('should assign an onChange function', () => {
    const mockFn = jasmine.createSpy();
    component.registerOnChange(mockFn);
    component.onChange();
    expect(mockFn).toHaveBeenCalled();
  });

  it('should implement onTouched', () => {
    expect(component.registerOnTouched).toBeTruthy();
    expect(component.registerOnTouched(() => undefined)).toBeFalsy();
  });

  it('should implement writeValue', () => {
    expect(component.writeValue).toBeTruthy();
    expect(component.writeValue()).toBeFalsy();
  });

  it('should work', () => {
    const fn = jasmine.createSpy();
    const fileName = 'fake-file.png';
    const file = new File(['(⌐□_□)'], fileName, { type: 'image/png' });

    component.registerOnChange(fn);
    component.emitFiles({ item: () => file, length: 1 } as FileList);
    expect(component.selectedFileName).toEqual(fileName);
    expect(fn).toHaveBeenCalled();

    component.emitFiles({ item: () => (null as unknown) as File, length: 1 } as FileList);
    expect(component.selectedFileName).toEqual('');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should clear', () => {
    component.selectedFileName = 'xxx';
    component.clearFileValue();
    expect(component.selectedFileName).toEqual('');
  });
});
