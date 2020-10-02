import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../environments/environment';
import { MatchPasswordValidator, StringifyHttpError } from '../_helpers';
import { errorNotification, Notification, successNotification, User } from '../_models';
import { AuthenticationService, DocumentTitleService, ErrorService } from '../_services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  editMode = false;
  loading = false;
  notification?: Notification;
  public password: string;
  confirmPasswordError = false;
  emailInfo: string = environment.links.updateProfileMain;
  profileForm: FormGroup;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly fb: FormBuilder,
    private readonly errors: ErrorService,
    private readonly documentTitleService: DocumentTitleService
  ) {}

  /** ngOnInit
  /* init of this component
  /* create the profile form
  /* set translation language
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Profile');
    this.createForm();
  }

  /** createForm
  /* create a profile form
  /* prefill the form with known data
  */
  createForm(): void {
    const user: User | null = this.authentication.currentUser;

    if (user) {
      this.profileForm = this.fb.group({
        'user-id': [{ value: user.userId, disabled: true }],
        email: [{ value: user.email, disabled: true }],
        'first-name': [{ value: user.firstName, disabled: true }],
        'last-name': [{ value: user.lastName, disabled: true }],
        'organization-name': [
          {
            value:
              user.organizationName && user.organizationName.length > 0
                ? user.organizationName
                : 'Unknown',
            disabled: true
          }
        ],
        country: [{ value: user.country ? user.country : 'Unknown', disabled: true }],
        'network-member': [{ value: user.networkMember ? 'Yes' : 'No', disabled: true }],
        'metis-user-flag': [{ value: user.metisUserFlag, disabled: true }],
        'account-role': [
          {
            value: user.accountRole && user.accountRole.length > 0 ? user.accountRole : 'Unknown',
            disabled: true
          }
        ],
        'created-date': [{ value: new Date(user.createdDate), disabled: true }],
        'updated-date': [{ value: new Date(user.updatedDate), disabled: true }],
        passwords: this.fb.group(
          {
            oldpassword: ['', Validators.required],
            password: ['', Validators.required],
            confirm: ['', Validators.required]
          },
          {
            validator: MatchPasswordValidator
          }
        )
      });
    }
  }

  /** toggleEditMode
  /* switch between readonly and edit mode
  */
  toggleEditMode(): void {
    this.profileForm.controls.passwords.reset();
    this.onKeyupPassword();

    this.notification = undefined;
    this.confirmPasswordError = false;
    this.editMode = !this.editMode;
  }

  /** onKeyupPassword
  /* get password when keyup
  */
  onKeyupPassword(): void {
    this.password = this.profileForm.controls.passwords.get('password')!.value;
  }

  checkMatchingPasswords(): void {
    if (MatchPasswordValidator(this.profileForm.controls.passwords) !== null) {
      this.confirmPasswordError = true;
    } else {
      this.confirmPasswordError = false;
    }
  }

  /** onSubmit
  /* submit current password form
  /* which is a part of the profile form
  */
  onSubmit(): void {
    this.notification = undefined;
    this.loading = true;
    const controls = this.profileForm.controls;
    const passwords = controls.passwords;
    const password = passwords.get('password')!.value;
    const oldpassword = passwords.get('oldpassword')!.value;

    const subUpdate = this.authentication.updatePassword(password, oldpassword).subscribe(
      (result) => {
        this.loading = false;
        this.toggleEditMode();
        if (result) {
          this.notification = successNotification('Update password successful!');
        } else {
          this.notification = errorNotification('Update password failed, please try again later');
        }
        subUpdate.unsubscribe();
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = errorNotification(
          `Update password failed: ${StringifyHttpError(error)}`
        );
        this.loading = false;
        subUpdate.unsubscribe();
      }
    );
  }

  /** onReloadProfile
  /* get most accurate user data from zoho
  */
  onReloadProfile(): void {
    this.notification = undefined;
    this.loading = true;

    const subReload = this.authentication
      .reloadCurrentUser(this.profileForm.controls.email.value)
      .subscribe(
        (result) => {
          if (result) {
            this.notification = successNotification('Your profile has been updated');
            this.createForm();
          } else {
            this.notification = errorNotification('Refresh failed, please try again later');
          }
          this.loading = false;
          subReload.unsubscribe();
          window.scrollTo(0, 0);
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = errorNotification(`Refresh failed: ${StringifyHttpError(error)}`);
          this.loading = false;
          subReload.unsubscribe();
          window.scrollTo(0, 0);
        }
      );
  }
}
