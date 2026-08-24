import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { RadioButtonComponent } from './radio-button.component';

describe('RadioButtonComponent', () => {
  let component: RadioButtonComponent;
  let fixture: ComponentFixture<RadioButtonComponent>;
  let formGroup: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RadioButtonComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(RadioButtonComponent);
    component = fixture.componentInstance;

    formGroup = new FormGroup({
      radioOps: new FormControl('')
    });

    fixture.componentRef.setInput('form', formGroup);
    fixture.componentRef.setInput('controlName', 'radioOps');
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('valueName', 'optionA');
    fixture.componentRef.setInput('disabled', false);

    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should register onChange callback successfully', () => {
    const mockFn = vi.fn();
    component.registerOnChange(mockFn);
    component.onInputChange(null);
    expect(mockFn).toHaveBeenCalledWith('optionA');
  });

  it('should register onTouched callback successfully', () => {
    const mockFn = vi.fn();
    component.registerOnTouched(mockFn);
    component.onTouch();
    expect(mockFn).toHaveBeenCalled();
  });

  it('should safely execute stubbed ControlValueAccessor methods without crashing', () => {
    expect(() => component.writeValue('optionA')).not.toThrow();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.disabled()).toBe(true);
  });

  it('should execute onChange hook when input changes', () => {
    const changeSpy = vi.fn();
    component.registerOnChange(changeSpy);

    component.onInputChange(new Event('change'));
    expect(changeSpy).toHaveBeenCalledWith('optionA');
  });

  it('should handle keyboard toggles, prevent default actions, and update form control state', () => {
    const mockEvent = ({ preventDefault: vi.fn() } as unknown) as Event;
    const changeSpy = vi.fn();

    component.registerOnChange(changeSpy);
    component.onKeyToggle(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(formGroup.get('radioOps')?.value).toBe('optionA');
    expect(changeSpy).toHaveBeenCalledWith('optionA');
  });

  describe('Signal Configurations Coverage Block', () => {
    it('should successfully update structural input signal configurations reactively', () => {
      expect(component.label()).toBe('Test Label');
      expect(component.valueName()).toBe('optionA');
      expect(component.controlName()).toBe('radioOps');

      fixture.componentRef.setInput('label', 'Updated Dynamic Label');
      fixture.componentRef.setInput('valueName', 'optionB');
      fixture.detectChanges();

      expect(component.label()).toBe('Updated Dynamic Label');
      expect(component.valueName()).toBe('optionB');
    });
  });
});
