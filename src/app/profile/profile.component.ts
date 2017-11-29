import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services';
import { User } from '../_models';
import { StringifyHttpError, MatchPasswordValidator } from '../_helpers';
import { FlashMessagesService } from 'angular2-flash-messages';
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
  error = '';
  public password = '';
  public emailInfo = environment.emails.profile;

  profileForm: FormGroup;

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    const user: User = this.authentication.currentUser;

    if (user) {
      this.profileForm = this.fb.group({
        'user-id': [user.userId],
        'email': [user.email],
        'first-name': [user.firstName],
        'last-name': [user.lastName],
        'organization-name': [user.organizationName && user.organizationName.length > 0 ? user.organizationName : 'Unknown'],
        'country': [user.country || 'Unknown'],
        'network-member': [user.networkMember ? 'Yes' : 'No'],
        'metis-user-flag': [user.metisUserFlag],
        'account-role': [user.accountRole && user.accountRole.length > 0 ? user.accountRole : 'Unknown'],
        'created-date': [new Date(user.createdDate)],
        'updated-date': [new Date(user.updatedDate)],
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
    this.error = '';
    this.editMode = !this.editMode;
  }

  onKeyupPassword() {
    this.password = this.profileForm.controls.passwords.get('password').value;
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    const controls = this.profileForm.controls;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;

    this.authentication.updatePassword(password).subscribe(result => {
        if (result === true) {
          this.onUpdatePassword();
        } else {
          this.error = 'Update password failed, please try again later';
        }
        this.loading = false;
        this.toggleEditMode();
      },
      (err: HttpErrorResponse) => {
        this.error = `Update password failed: ${StringifyHttpError(err)}`;
        this.loading = false;
      });
  }

  onReloadProfile() {
    this.error = '';
    this.loading = true;
    this.authentication.reloadCurrentUser().subscribe(result => {
        if (result === true) {
          this.createForm();
        } else {
          this.error = 'Refresh failed, please try again later';
        }
        this.loading = false;
      },
      (err: HttpErrorResponse) => {
        this.error = `Refresh failed: ${StringifyHttpError(err)}`;
        this.loading = false;
      });
  }

  private onUpdatePassword() {
    this.flashMessage.show('Update password successful!', { cssClass: 'alert-success', timeout: 50000 });
  }
}
