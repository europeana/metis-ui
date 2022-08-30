import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { environment } from '../../environments/environment';
import { MatchPasswordValidator, StringifyHttpError } from '../_helpers';
import { errorNotification, Notification, successNotification, User } from '../_models';
import { AuthenticationService, DocumentTitleService, ErrorService } from '../_services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent extends SubscriptionManager implements OnInit {
  editMode = false;
  loading = false;
  notification?: Notification;
  public password: string;
  confirmPasswordError = false;
  emailInfo: string = environment.links.updateProfileMain;
  profileForm: UntypedFormGroup;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly fb: UntypedFormBuilder,
    private readonly errors: ErrorService,
    private readonly documentTitleService: DocumentTitleService
  ) {
    super();
  }

  /** ngOnInit
  /* set the title
  /* create the profile form
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
            validators: MatchPasswordValidator
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
  /* set password variable to input value
  */
  onKeyupPassword(): void {
    this.password = (this.profileForm.controls.passwords.get('password') as UntypedFormControl).value;
  }

  /** checkMatchingPasswords
  /* set confirmPasswordError variable according to MatchPasswordValidator
  */
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
    const password = (passwords.get('password') as UntypedFormControl).value;
    const oldpassword = (passwords.get('oldpassword') as UntypedFormControl).value;

    this.subs.push(
      this.authentication.updatePassword(password, oldpassword).subscribe(
        (result) => {
          this.loading = false;
          this.toggleEditMode();
          if (result) {
            this.notification = successNotification('Update password successful!');
          } else {
            this.notification = errorNotification('Update password failed, please try again later');
          }
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = errorNotification(
            `Update password failed: ${StringifyHttpError(error)}`
          );
          this.loading = false;
        }
      )
    );
  }

  /** onReloadProfile
  /* load most accurate user data from zoho and handle result
  */
  onReloadProfile(): void {
    this.notification = undefined;
    this.loading = true;
    this.subs.push(
      this.authentication.reloadCurrentUser(this.profileForm.controls.email.value).subscribe(
        (result) => {
          if (result) {
            this.notification = successNotification('Your profile has been updated');
            this.createForm();
          } else {
            this.notification = errorNotification('Refresh failed, please try again later');
          }
          this.loading = false;
          window.scrollTo(0, 0);
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = errorNotification(`Refresh failed: ${StringifyHttpError(error)}`);
          this.loading = false;
          window.scrollTo(0, 0);
        }
      )
    );
  }
}
