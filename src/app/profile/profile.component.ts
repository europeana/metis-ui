import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';


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
  user: {};
  userRole: string;
  userApproved: boolean;
  editMode = false; // if not edit, then preview
  errors = false;
  success = false;
  message: string;

  ngOnInit(): void {

    this.authentication.redirectLogin();
    
    this.route.params.subscribe(params => {
      this.user = this.authentication.getUserInfo(params['id']);
    });

    this.userRole = this.user['role'];
    this.userApproved = this.user['approved'];

    this.profileForm = this.fb.group({
      'userId': [this.user['id'], [Validators.required]],
      'userEmail': [this.user['email'], [Validators.required]],
      'userFirstName': [this.user['firstname'], [Validators.required]],
      'userLastName': [this.user['lastname'], [Validators.required]],
      'userPassword': ['test1234', [Validators.required]],
      'userCountry': [this.user['country']],
      'userSkype': [this.user['skypeid']],
      'roles': [],
      'userNotes': [this.user['notes']],
      'userActive': [this.user['active']],
      'userApproved': [this.user['approved']],
      'userCreated': [this.user['created']],
      'userUpdated': [this.user['updated']]
    });

    this.selectedOrganizations = this.user['organizations'];
  }

  toggleEditMode() {
    if (this.editMode === false) {
      this.editMode = true;
    } else {
      this.editMode = false;
    }
  }  

  onSubmit() {
    this.toggleEditMode();
    this.success = true;
    this.message = 'You just updated your profile!';
  }

}
