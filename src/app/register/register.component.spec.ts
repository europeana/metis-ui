import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockAuthenticationService, MockTranslateService } from '../_mocked';
import { NotificationType } from '../_models';
import { AuthenticationService } from '../_services';
import { TranslateService } from '../_translate';

import { RegisterComponent } from '.';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let submitBtn;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [RegisterComponent, createMockPipe('translate')],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('updates the password on key-up', () => {
    expect(component.password).toBeFalsy();
    component.registerForm.get('passwords.password')!.setValue('password');
    component.onKeyupPassword();
    expect(component.password).toBeTruthy();
  });

  it('should contain a form', () => {
    expect(fixture.nativeElement.querySelector('.metis-register-form') === null).toBe(false);
  });

  it('should contain a disabled button at first', () => {
    submitBtn = fixture.nativeElement.querySelector('app-loading-button');
    expect(submitBtn.disabled).toBe(true);
  });

  it('should submit the form', () => {
    submitBtn = fixture.nativeElement.querySelector('app-loading-button');
    component.registerForm.controls.email.setValue('test@mocked.com');
    (component.registerForm.controls.passwords as FormGroup).controls.password.setValue(
      '!Passw0rd123'
    );
    (component.registerForm.controls.passwords as FormGroup).controls.confirm.setValue(
      '!Passw0rd123'
    );
    component.onSubmit();
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(false);
  });

  it('should reject weak password', () => {
    submitBtn = fixture.nativeElement.querySelector('app-loading-button');
    component.registerForm.controls.email.setValue('test@mocked.com');
    (component.registerForm.controls.passwords as FormGroup).controls.password.setValue('');
    (component.registerForm.controls.passwords as FormGroup).controls.confirm.setValue('');
    component.onSubmit();
    fixture.detectChanges();
    expect(component.notification).toBeTruthy();
    if (component.notification) {
      expect(component.notification.type).toEqual(NotificationType.ERROR);
    }
  });
});
