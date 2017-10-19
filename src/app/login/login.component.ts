import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService]
})
export class LoginComponent {

  loginForm: FormGroup;
  errors: boolean;
  errorMessage: string;

  constructor(private authentication: AuthenticationService, private fb: FormBuilder) {
    this.authentication.redirectProfile();
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      'email': ['', Validators.required ],
      'password': ['', Validators.required ]
    });
  }

  onSubmit() {
    if (this.authentication.validateUser(this.loginForm) === false) {
      this.errors = true;
      this.errorMessage = 'Wrong credentials';
    }
  }

}
