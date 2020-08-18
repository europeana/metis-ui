import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import {
  createMockPipe,
  MockAuthenticationService,
  MockAuthenticationServiceErrors,
  MockErrorService
} from '../_mocked';
import { AuthenticationService, ErrorService } from '../_services';

import { ProfileComponent } from '.';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProfileComponent, createMockPipe('translate')],
      providers: [
        {
          provide: AuthenticationService,
          useClass: errorMode ? MockAuthenticationServiceErrors : MockAuthenticationService
        },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should reload the profile form', fakeAsync(() => {
      component.editMode = false;
      fixture.detectChanges();
      const reload = fixture.debugElement.query(By.css('#refresh-btn'));
      reload.triggerEventHandler('click', null);
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('Your profile has been updated');
    }));

    it('should check the passwords match', () => {
      const pwCorrect = 'correct';
      const pwError = 'incorrect';

      const password = component.profileForm.get('passwords.password');
      const confirm = component.profileForm.get('passwords.confirm');

      expect(component.confirmPasswordError).toBeFalsy();

      password!.setValue(pwError);
      confirm!.setValue(pwCorrect);

      component.checkMatchingPasswords();

      expect(component.confirmPasswordError).toBeTruthy();

      password!.setValue(pwCorrect);
      confirm!.setValue(pwCorrect);

      component.checkMatchingPasswords();
      expect(component.confirmPasswordError).toBeFalsy();
    });

    it('should submit the form', fakeAsync(() => {
      component.editMode = false;
      component.toggleEditMode();
      fixture.detectChanges();

      const submit = fixture.debugElement.query(By.css('app-loading-button'));
      submit.triggerEventHandler('click', null);
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('Update password successful!');
    }));
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should handle errors submitting the form', fakeAsync(() => {
      component.editMode = false;
      component.toggleEditMode();
      fixture.detectChanges();

      const submit = fixture.debugElement.query(By.css('app-loading-button'));
      submit.triggerEventHandler('click', null);
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe(
        'Update password failed: 401 Mock updatePassword Error'
      );
    }));

    it('should handle reloading', fakeAsync(() => {
      component.onReloadProfile();
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe(
        'Refresh failed: 401 Mock reloadCurrentUser Error'
      );
    }));
  });
});
