/*
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import {
  createMockPipe,
  MockAuthenticationService,
  MockAuthenticationServiceErrors,
  MockTranslateService
} from '../_mocked';
import { NotificationType } from '../_models';
import { AuthenticationService } from '../_services';
import { TranslateService } from '../_translate';
import { LoginComponent } from '../login';
import { RegisterComponent } from '.';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let submitBtn: HTMLInputElement;
  let authentication: AuthenticationService;
  let router: Router;

  const configureTestingModule = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: './signin', component: LoginComponent }]),
        ReactiveFormsModule,
        RegisterComponent,
        createMockPipe('translate')
      ],
      providers: [
        {
          provide: AuthenticationService,
          useClass: errorMode ? MockAuthenticationServiceErrors : MockAuthenticationService
        },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
    authentication = TestBed.inject(AuthenticationService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillValidForm = (): void => {
    component.registerForm.controls.email.setValue('test@mocked.com');
    component.registerForm.controls.passwords.controls.password.setValue('!Passw0rd123');
    component.registerForm.controls.passwords.controls.confirm.setValue('!Passw0rd123');
  };

  describe('Normal operations', () => {
    beforeEach(async(() => {
      configureTestingModule();
    }));

    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('updates the password on key-up', () => {
      expect(component.password).toBeFalsy();
      component.registerForm.controls.passwords.controls.password.setValue('password');
      expect(component.password).toBeFalsy();
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

    it('should not register if submit fails', fakeAsync(() => {
      spyOn(router, 'navigate');
      spyOn(authentication, 'register').and.callFake(() => {
        return of(false);
      });
      fillValidForm();
      component.onSubmit();
      tick(3000);
      tick(1);
      fixture.detectChanges();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should submit the form and redirect', fakeAsync(() => {
      spyOn(router, 'navigate');
      submitBtn = fixture.nativeElement.querySelector('app-loading-button');
      fillValidForm();
      component.onSubmit();
      tick(3000);
      tick(1);
      fixture.detectChanges();
      expect(submitBtn.disabled).toBeFalsy();
      expect(component.loading).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['/signin']);
    }));

    it('should reject weak password', () => {
      submitBtn = fixture.nativeElement.querySelector('app-loading-button');
      component.registerForm.controls.email.setValue('test@mocked.com');
      component.registerForm.controls.passwords.controls.password.setValue('');
      component.registerForm.controls.passwords.controls.confirm.setValue('');
      expect(submitBtn.disabled).toBeTruthy();
      component.onSubmit();
      fixture.detectChanges();
      expect(component.notification).toBeTruthy();
      if (component.notification) {
        expect(component.notification.type).toEqual(NotificationType.ERROR);
      }
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestingModule(true);
    }));

    beforeEach(b4Each);

    it('should handle submit errors', fakeAsync(() => {
      fillValidForm();
      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification).toBeTruthy();
      if (component.notification) {
        expect(component.notification.type).toEqual(NotificationType.ERROR);
      }
    }));
  });
});
*/
