import 'rxjs/add/operator/switchMap';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    private route: ActivatedRoute) { }

  profileForm: FormGroup;
  allOrganizations: {};
  isSuggesting = false;
  isRoles = false;
  suggestedRoles: {};
  addRoleTo: number;
  suggestedOrganizations: {};
  selectedOrganizations = [{ id: 11, name: 'Europeana' }, { id: 12, name: 'KB' }];
  user: {};
  userRole: string;
  userApproved: boolean;
  editMode = false; // if not edit, then preview

  ngOnInit(): void {

    this.authentication.redirectLogin();

    this.route.params.subscribe(params => {
      this.user = this.authentication.getUserInfo(params['id']);
    });

    this.userRole = this.user['role'];
    this.userApproved = this.user['approved'];

    this.profileForm = new FormGroup({
      'userId': new FormControl(this.user['id'], [Validators.required]),
      'userEmail': new FormControl('bilbo.baggins@europeana.eu', [Validators.required]),
      'userFirstName': new FormControl('Bilbo', [Validators.required]),
      'userLastName': new FormControl('Baggins', [Validators.required]),
      'userPassword': new FormControl('test1234', [Validators.required]),
      'userCountry': new FormControl('Belgium'),
      'userSkype': new FormControl('bbaggins'),
      'organizations': new FormControl(''),
      'roles': new FormControl(''),
      'userNotes': new FormControl('Mapping for edm:rights'),
      'userActive': new FormControl('Yes'),
      'userApproved': new FormControl('No'),
      'userCreated': new FormControl('22 April 2011'),
      'userUpdated': new FormControl('2 june 2012')
    });
  }

  toggleEditMode() {
    if (this.editMode === false) {
      this.editMode = true;
    } else {
      this.editMode = false;
    }
  }  

  onSubmit() {
    console.log('submit');
  }

}
