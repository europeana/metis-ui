import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services';
import { User } from '../_models';
import { StringifyHttpError, MatchPasswordValidator } from '../_helpers';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [AuthenticationService]
})

export class ProfileComponent implements OnInit {
  editMode = false;
  loading = false;
  errorMessage: string;
  successMessage: string;
  public password = '';
  public emailInfo = environment.emails.profile;

  profileForm: FormGroup;

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }

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

  toggleEditMode() {
    this.errorMessage = '';
    this.editMode = !this.editMode;
  }

  onKeyupPassword() {
    this.password = this.profileForm.controls.passwords.get('password').value;
  }

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;
    const controls = this.profileForm.controls;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;

    this.authentication.updatePassword(password).subscribe(result => {
      if (result === true) {
        this.onUpdatePassword();
      } else {
        this.errorMessage = 'Update password failed, please try again later';
      }
      this.loading = false;
      this.toggleEditMode();
    },
    (err: HttpErrorResponse) => {

      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }
      
      this.errorMessage = `Update password failed: ${StringifyHttpError(err)}`;
      this.loading = false;
    });
  }

  onReloadProfile() {
    this.errorMessage = '';
    this.loading = true;

    this.authentication.reloadCurrentUser(this.profileForm.controls['email'].value).subscribe(result => {
      if (result === true) {
        this.successMessage = 'Your profile has been updated';
        this.createForm();
      } else {
        this.errorMessage = 'Refresh failed, please try again later';
      }
      this.loading = false;
    },
    (err: HttpErrorResponse) => {
      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }

      this.errorMessage = `Refresh failed: ${StringifyHttpError(err)}`;
      this.loading = false;
    });

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);   

  }

  private onUpdatePassword() {
    this.successMessage = 'Update password successful!';
  }
}
