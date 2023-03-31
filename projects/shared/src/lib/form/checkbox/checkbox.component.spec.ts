import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CheckboxComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    expect(component.registerOnChange).toBeTruthy();
    expect(component.registerOnTouched).toBeTruthy();
    expect(component.onChange).toBeTruthy();
    expect(component.onTouch).toBeTruthy();
    expect(component.writeValue).toBeTruthy();
    component.writeValue();
    component.onChange();
    component.onTouch();
    component.registerOnTouched();
    component.registerOnChange(() => {
      console.log('unimplemented');
    });
    spyOn(component, 'onChange');
    component.onInputChange('X');
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should handle key events', () => {
    const fnPreventDefault = jasmine.createSpy();
    spyOn(component, 'onChange');
    component.controlName = 'checkboxOp';
    component.form = new UntypedFormBuilder().group({
      checkboxOp: ['']
    });
    expect(component.form.value.checkboxOp).toBeFalsy();
    component.onKeyToggle(({ preventDefault: fnPreventDefault } as unknown) as Event);
    expect(fnPreventDefault).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
    expect(component.form.value.checkboxOp).toBeTruthy();
  });

});
