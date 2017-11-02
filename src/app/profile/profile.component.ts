import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services';
import { User } from '../_models';

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
  editMode = false;

  ngOnInit(): void {

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
      'updated-date': [new Date(user.updatedDate)]
    });

  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onSubmit() {
    console.log('onSubmit()');
    this.toggleEditMode();
  }
}
