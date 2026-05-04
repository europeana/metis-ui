import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RadioButtonComponent } from './radio-button.component';

describe('RadioButtonComponent', () => {
  let component: RadioButtonComponent;
  let fixture: ComponentFixture<RadioButtonComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RadioButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'form',
      new UntypedFormBuilder().group({
        radioOps: ['']
      })
    );
    fixture.componentRef.setInput('controlName', 'radioOps');
    fixture.componentRef.setInput('label', 'radio label');
    fixture.componentRef.setInput('valueName', 'valueName');

    component.onTouch();
    component.onChange();
    component.registerOnChange(vi.fn());
    component.registerOnTouched(vi.fn());
    component.writeValue('X');
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
  });

  it('should create (implement ControlValueAccessor)', () => {
    expect(component).toBeTruthy();
  });

  it('should bind a change handler', () => {
    component.onInputChange('X');
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should handle key events', () => {
    const fnPreventDefault = vi.fn();
    component.onKeyToggle(({ preventDefault: fnPreventDefault } as unknown) as Event);
    expect(fnPreventDefault).toHaveBeenCalled();
  });
});
