import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/index';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [AuthenticationService]
})

export class ProfileComponent implements OnInit {

  constructor(private http: HttpClient,
    private authentication: AuthenticationService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  profileForm: FormGroup;
  selectedOrganizations;
  user: User;
  userRole: string;
  editMode = false; // if not edit, then preview
  errors = false;
  success = false;
  message: string;

  ngOnInit(): void {

    this.user = this.authentication.currentUser;
    this.userRole = this.user.accountRole;

    this.profileForm = this.fb.group({
      'userId': [this.user.userId, [Validators.required]],
      'userEmail': [this.user.email, [Validators.required]],
      'userFirstName': [this.user.firstName, [Validators.required]],
      'userLastName': [this.user.lastName, [Validators.required]],
      'userPassword': ['test1234', [Validators.required]],
      'userCountry': [this.user.country],
      'userSkype': [this.user.skypeId || ''],
      'roles': [this.user.accountRole || ''],
      'userNotes': [this.user.notes || ''],
      'userActive': [this.user.active],
      'userCreated': [this.user.createdDate],
      'userUpdated': [this.user.updatedDate]
    });

    this.selectedOrganizations = this.user.organizationName;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onSubmit() {
    this.toggleEditMode();
    this.success = true;
    this.message = 'You just updated your profile!';
  }

}
