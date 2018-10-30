import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthenticationService, TranslateService, RedirectPreviousUrl, ErrorService } from '../_services';
import { TRANSLATION_PROVIDERS, TranslatePipe } from '../_translate';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MockAuthenticationService, currentUser } from '../_mocked';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let submitBtn;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule ],
      declarations: [ RegisterComponent, TranslatePipe ],
      providers: [
        RedirectPreviousUrl,
        ErrorService,
        {provide: AuthenticationService, useClass: MockAuthenticationService},
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
      }],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a form', () => {
    expect(fixture.nativeElement.querySelector('.metis-register-form') === null).toBe(false);
  });

  it('should contain a disabled button at first', () => {
    submitBtn = fixture.nativeElement.querySelector('.submit-btn');
    expect(submitBtn.disabled).toBe(true);
  });

  it('should submit the form', () => {
    component.registerForm.controls.email.setValue('test@mocked.com');
    component.registerForm.controls.passwords['controls'].password.setValue('!Passw0rd123');
    component.registerForm.controls.passwords['controls'].confirm.setValue('!Passw0rd123');
    component.onSubmit();
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);
  });

});
