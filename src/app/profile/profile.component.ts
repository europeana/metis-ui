import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router }   from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { OrganizationsService } from '../services/organizations.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [AuthenticationService, OrganizationsService]
})

export class ProfileComponent implements OnInit {

  constructor(private http: HttpClient, 
      private authentication: AuthenticationService, 
      private organizations: OrganizationsService,
      public router: Router) { }

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
  editMode = false;

  ngOnInit(): void {
    
    this.authentication.redirectLogin()
    
    this.user = this.authentication.getUserInfo();
    this.userRole = this.user['role'];
    this.userApproved = this.user['approved'];

  	this.profileForm = new FormGroup({
      'userId': new FormControl(this.user['id'], [Validators.required]),
      'userEmail': new FormControl('bilbo.baggins@europeana.eu', [Validators.required]),
      'userFirstName': new FormControl('Bilbo', [Validators.required]),
      'userLastName': new FormControl('Baggins'),
      'userPassword': new FormControl('test1234'),
      'userCountry': new FormControl('Belgium'),
      'userSkype': new FormControl('bbaggins', [Validators.required]),
      'organizations': new FormControl(''),
      'userNotes': new FormControl('Mapping for edm:rights'),
      'userActive': new FormControl('Yes'),
      'userApproved': new FormControl('No'),
      'userCreated': new FormControl('22 April 2011'),
      'userUpdated': new FormControl('2 june 2012')
    });

    this.organizations.getOrganizations().subscribe(data => this.allOrganizations = data['results']);

  }

  toggleEditMode() {
    if (this.editMode == false) {
      this.editMode = true;
    } else {
      this.editMode = false;
    }
  }

  searchOrganization(term) {
    this.isSuggesting = true;
    this.organizations.searchOrganizations(term).subscribe(data => this.suggestedOrganizations = data['Organizations']);
  }

  selectThisOrganization(id, org) {
    this.selectedOrganizations.push({id: id, name: org});
    this.isSuggesting = false;
    this.profileForm.get('organizations').setValue('');
  }

  selectRole(org) {
    this.addRoleTo = org;
    this.isRoles = true;
    this.organizations.getRoles(org).subscribe(data => this.suggestedRoles = data['results']);
  }

  confirmRole(role) {
    console.log(role, this.addRoleTo);
    this.closeRolesModal();
  }

  closeRolesModal () {
    this.isRoles = false;
  }

  onSubmit() {
    console.log('submit');
  }

}
