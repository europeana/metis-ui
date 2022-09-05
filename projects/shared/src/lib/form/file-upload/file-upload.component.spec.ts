import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FileUploadComponent],
      providers: [{ provide: UntypedFormBuilder, useValue: formBuilder }],
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
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    component.registerOnChange(fn);
    component.emitFiles({ item: () => file, length: 1 } as FileList);
    expect(fn).toHaveBeenCalled();
  });
});
