import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService, TranslateService, ErrorService } from '../_services';
import { User } from '../_models';
import { StringifyHttpError, MatchPasswordValidator } from '../_helpers';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  editMode = false;
  loading = false;
  errorMessage?: string;
  successMessage?: string;
  public password: string;
  confirmPasswordError = false;
  emailInfo: string = environment.links.updateProfileMain;
  profileForm: FormGroup;

  constructor(
    private authentication: AuthenticationService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private errors: ErrorService,
  ) {}

  /** ngOnInit
  /* init of this component
  /* create the profile form
  /* set translation language
  */
  ngOnInit(): void {
    this.createForm();
    this.translate.use('en');
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
            disabled: true,
          },
        ],
        country: [{ value: user.country ? user.country : 'Unknown', disabled: true }],
        'network-member': [{ value: user.networkMember ? 'Yes' : 'No', disabled: true }],
        'metis-user-flag': [{ value: user.metisUserFlag, disabled: true }],
        'account-role': [
          {
            value: user.accountRole && user.accountRole.length > 0 ? user.accountRole : 'Unknown',
            disabled: true,
          },
        ],
        'created-date': [{ value: new Date(user.createdDate), disabled: true }],
        'updated-date': [{ value: new Date(user.updatedDate), disabled: true }],
        passwords: this.fb.group(
          {
            oldpassword: ['', Validators.required],
            password: ['', Validators.required],
            confirm: ['', Validators.required],
          },
          {
            validator: MatchPasswordValidator,
          },
        ),
      });
    }
  }

  /** toggleEditMode
  /* switch between readonly and edit mode
  */
  toggleEditMode(): void {
    this.profileForm.controls.passwords.reset();
    this.onKeyupPassword();

    this.errorMessage = undefined;
    this.confirmPasswordError = false;
    this.editMode = !this.editMode;

    if (this.editMode) {
      this.successMessage = undefined;
    }
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
    this.errorMessage = undefined;
    this.loading = true;
    const controls = this.profileForm.controls;
    const passwords = controls.passwords;
    const password = passwords.get('password')!.value;
    const oldpassword = passwords.get('oldpassword')!.value;

    this.authentication.updatePassword(password, oldpassword).subscribe(
      (result) => {
        if (result) {
          this.successMessage = 'Update password successful!';
        } else {
          this.errorMessage = 'Update password failed, please try again later';
        }
        this.loading = false;
        this.toggleEditMode();
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `Update password failed: ${StringifyHttpError(error)}`;
        this.loading = false;
      },
    );
  }

  /** onReloadProfile
  /* get most accurate user data from zoho
  */
  onReloadProfile(): void {
    this.errorMessage = undefined;
    this.loading = true;

    this.authentication.reloadCurrentUser(this.profileForm.controls.email.value).subscribe(
      (result) => {
        if (result) {
          this.successMessage = 'Your profile has been updated';
          this.createForm();
        } else {
          this.errorMessage = 'Refresh failed, please try again later';
        }
        this.loading = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `Refresh failed: ${StringifyHttpError(error)}`;
        this.loading = false;
      },
    );

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);
  }
}
