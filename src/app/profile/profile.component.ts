import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService, TranslateService, ErrorService } from '../_services';
import { User } from '../_models';
import { StringifyHttpError, MatchPasswordValidator } from '../_helpers';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  editMode = false;
  loading = false;
  errorMessage: string;
  successMessage: string;
  public password;

  profileForm: FormGroup;

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    private fb: FormBuilder, 
    private translate: TranslateService,
    private errors: ErrorService) { }

  /** ngOnInit
  /* init of this component
  /* create the profile form
  /* set translation language
  */
  ngOnInit() {
    this.createForm();
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** createForm
  /* create a profile form
  /* prefill the form with known data
  */
  createForm() {
    const user: User = this.authentication.currentUser;

    if (user) {
      this.profileForm = this.fb.group({
        'user-id': [{value: user.userId, disabled: true}],
        'email': [{value: user.email, disabled: true}],
        'first-name': [{value: user.firstName, disabled: true}],
        'last-name': [{value: user.lastName, disabled: true}],
        'organization-name': [{value: user.organizationName && user.organizationName.length > 0 ? user.organizationName : 'Unknown', disabled: true}],
        'country': [{value: user.country ? user.country : 'Unknown', disabled: true}],
        'network-member': [{value: user.networkMember ? 'Yes' : 'No', disabled: true}],
        'metis-user-flag': [{value: user.metisUserFlag, disabled: true}],
        'account-role': [{value: user.accountRole && user.accountRole.length > 0 ? user.accountRole : 'Unknown', disabled: true}],
        'created-date': [{value: new Date(user.createdDate), disabled: true}],
        'updated-date': [{value: new Date(user.updatedDate), disabled: true}],
        passwords: this.fb.group({
          password: ['', Validators.required ],
          confirm: ['', Validators.required ]
        }, {
          validator: MatchPasswordValidator
        })
      });
    }
  }  

  /** toggleEditMode
  /* switch between readonly and edit mode
  */
  toggleEditMode() {
    this.errorMessage = undefined;
    this.editMode = !this.editMode;
  }

  /** onKeyupPassword
  /* get password when keyup
  */
  onKeyupPassword() {
    this.password = this.profileForm.controls.passwords.get('password').value;
  }

  /** onSubmit
  /* submit current password form
  /* which is a part of the profile form
  */
  onSubmit() {
    this.errorMessage = undefined;
    this.loading = true;
    const controls = this.profileForm.controls;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;

    this.authentication.updatePassword(password).subscribe(result => {
      if (result === true) {
        this.successMessage = 'Update password successful!';
      } else {
        this.errorMessage = 'Update password failed, please try again later';
      }
      this.loading = false;
      this.toggleEditMode();
    }, (err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `Update password failed: ${StringifyHttpError(error)}`;
      this.loading = false;
    });
  }

  /** onReloadProfile
  /* get most accurate user data from zoho
  */
  onReloadProfile() {
    this.errorMessage = undefined;
    this.loading = true;

    this.authentication.reloadCurrentUser(this.profileForm.controls['email'].value).subscribe(result => {
      if (result === true) {
        this.successMessage = 'Your profile has been updated';
        this.createForm();
      } else {
        this.errorMessage = 'Refresh failed, please try again later';
      }
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `Refresh failed: ${StringifyHttpError(error)}`;
      this.loading = false;
    });

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);   
  }

}
