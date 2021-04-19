import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import {
  createMockPipe,
  MockAuthenticationService,
  MockAuthenticationServiceErrors,
  MockErrorService
} from '../_mocked';
import { AccountRole } from '../_models';
import { AuthenticationService, ErrorService } from '../_services';

import { ProfileComponent } from '.';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authentication: AuthenticationService;

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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    authentication = TestBed.inject(AuthenticationService);
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

    it('should not create the form without a user', () => {
      authentication.currentUser = null;
      component.profileForm = (undefined as unknown) as FormGroup;
      component.createForm();
      fixture.detectChanges();
      expect(component.profileForm).toBeFalsy();
    });

    it('should create and prefill the form', () => {
      component.createForm();
      expect(component.profileForm).toBeTruthy();
      const defaultVal = 'Unknown';
      const getVal = (fieldName: string): string => {
        const field = component.profileForm.get(fieldName) as FormControl;
        return field.value as string;
      };

      expect(getVal('account-role')).toEqual(AccountRole.EUROPEANA_DATA_OFFICER);
      expect(getVal('country')).toEqual('Netherlands');
      expect(getVal('network-member')).toEqual('Yes');
      expect(getVal('organization-name')).toEqual('organization');

      authentication.currentUser = Object.assign(authentication.currentUser, {
        accountRole: null,
        country: null,
        networkMember: null,
        organizationName: null
      });
      component.createForm();
      fixture.detectChanges();

      expect(getVal('account-role')).toEqual(defaultVal);
      expect(getVal('country')).toEqual(defaultVal);
      expect(getVal('network-member')).toEqual('No');
      expect(getVal('organization-name')).toEqual(defaultVal);
    });

    it('should reload the profile form (success)', fakeAsync(() => {
      component.onReloadProfile();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('Your profile has been updated');
    }));

    it('should reload the profile form (fail)', fakeAsync(() => {
      spyOn(authentication, 'reloadCurrentUser').and.callFake((_) => {
        return of(false);
      });
      component.onReloadProfile();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('Refresh failed, please try again later');
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

    it('should submit the form (success)', fakeAsync(() => {
      component.editMode = false;
      component.toggleEditMode();
      fixture.detectChanges();
      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('Update password successful!');
    }));

    it('should submit the form (fail)', fakeAsync(() => {
      component.editMode = false;

      component.toggleEditMode();
      fixture.detectChanges();

      spyOn(authentication, 'updatePassword').and.callFake((_) => {
        return of(false);
      });
      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe(
        'Update password failed, please try again later'
      );
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
      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe(
        'Update password failed: 401 Mock updatePassword Error'
      );
    }));

    it('should handle reloading', fakeAsync(() => {
      component.onReloadProfile();
      expect(component.loading).toBeTruthy();
      tick(1);
      fixture.detectChanges();
      expect(component.loading).toBeFalsy();
      expect(component.notification!.content).toBe(
        'Refresh failed: 401 Mock reloadCurrentUser Error'
      );
    }));
  });
});
