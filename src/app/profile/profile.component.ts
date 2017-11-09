import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services';
import { User } from '../_models';
import { StringifyHttpError, MatchPassword } from '../_helpers';
import { FlashMessagesService } from 'angular2-flash-messages';

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

  profileForm: FormGroup;

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    const user: User = this.authentication.currentUser;

    this.profileForm = this.fb.group({
      'user-id': [user.userId],
      'email': [user.email],
      'first-name': [user.firstName],
      'last-name': [user.lastName],
      'organization-name': [user.organizationName || 'Unknown'],
      'country': [user.country || 'Unknown'],
      'network-member': [user.networkMember],
      'metis-user-flag': [user.metisUserFlag],
      'account-role': [user.accountRole || 'Unknown'],
      'created-date': [new Date(user.createdDate)],
      'updated-date': [new Date(user.updatedDate)],
       passwords: this.fb.group({
        password: ['', Validators.required ],
        confirm: ['', Validators.required ]
      }, {
        validator: MatchPassword
      })
    });

  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onSubmit() {
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

  private onUpdatePassword() {
    this.flashMessage.show('Update password successful!', { cssClass: 'alert-success', timeout: 5000 });
  }
}
