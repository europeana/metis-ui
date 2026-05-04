import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ReactiveFormsModule, CheckboxComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  describe('With Form', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('attrE2E', 'e2e-attribute');
      fixture.componentRef.setInput('controlName', 'checkboxOp');
      fixture.componentRef.setInput('labelText', 'label text');
      fixture.componentRef.setInput(
        'form',
        new UntypedFormBuilder().group({
          checkboxOp: ['']
        })
      );
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
      vi.spyOn(component, 'onChange');
      component.onInputChange('X');
      expect(component.onChange).toHaveBeenCalled();
    });

    it('should handle key events (form)', () => {
      const fnPreventDefault = vi.fn();
      vi.spyOn(component, 'onChange');

      const form = component.form();
      expect(form?.value.checkboxOp).toBeFalsy();
      component.onKeyToggle(({ preventDefault: fnPreventDefault } as unknown) as Event);
      expect(fnPreventDefault).toHaveBeenCalled();
      expect(component.onChange).toHaveBeenCalled();
      expect(form?.value.checkboxOp).toBeTruthy();
    });
  });

  describe('Without Form', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('attrE2E', 'e2e-attribute');
      fixture.componentRef.setInput('controlName', 'checkboxOp');
      fixture.componentRef.setInput('labelText', 'label text');
      //      fixture.componentRef.setInput('form', new UntypedFormBuilder().group({
      //      checkboxOp: ['']
      //  }));
      component = fixture.componentInstance;
      expect(component).toBeTruthy();
      fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
      fixture.detectChanges();
    });

    it('should toggle', () => {
      vi.spyOn(component.valueChanged, 'emit');
      component.toggle();
      expect(component.valueChanged.emit).toHaveBeenCalled();
    });
  });
});
