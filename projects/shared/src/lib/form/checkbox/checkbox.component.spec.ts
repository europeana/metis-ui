import '@angular/localize/init';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should work without a form provided (Standalone Mode)', () => {
    const spy = vi.spyOn(component.valueChanged, 'emit');

    // Act
    component.toggle();

    // Assert
    expect(component.isChecked()).toBe(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should not toggle when disabled', () => {
    component.disabled.set(true);
    component.toggle();
    expect(component.isChecked()).toBe(false);
  });

  it('should update via CVA writeValue', () => {
    component.writeValue(true);
    expect(component.isChecked()).toBe(true);
  });

  it('should register CVA callbacks', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();

    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.toggle();

    expect(onChange).toHaveBeenCalled();
    expect(onTouched).toHaveBeenCalled();
  });
});
