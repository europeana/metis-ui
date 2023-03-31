import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RadioButtonComponent } from './radio-button.component';

describe('RadioButtonComponent', () => {
  let component: RadioButtonComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RadioButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(RadioButtonComponent);
    component = new RadioButtonComponent();
    component.onTouch();
    component.onChange();
    component.registerOnChange(jasmine.createSpy());
    component.registerOnTouched(jasmine.createSpy());
    component.writeValue('X');
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
    fixture.detectChanges();
  });

  it('should create (implement ControlValueAccessor)', () => {
    expect(component).toBeTruthy();
  });

  it('should bind a change handler', () => {
    component.onInputChange('X');
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should handle key events', () => {
    const fnPreventDefault = jasmine.createSpy();
    component.controlName = 'radioOps';
    component.form = new UntypedFormBuilder().group({
      radioOps: ['']
    });
    component.onKeyToggle(({ preventDefault: fnPreventDefault } as unknown) as Event);
    expect(fnPreventDefault).toHaveBeenCalled();
  });
});
