import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService]
})
export class LoginComponent implements OnInit {
  loading = false;
  error = '';

  loginForm: FormGroup;

  constructor(
    private router: Router,
    private authentication: AuthenticationService,
    private fb: FormBuilder) { }

  ngOnInit() {
    // reset login status
    this.authentication.logout();
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email] ],
      'password': ['', Validators.required ]
    });
  }

  onSubmit() {
    this.loading = true;
    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    this.authentication.login(email, password).subscribe(result => {
      if (result === true) {
        this.router.navigate(['/profile']);
      } else {
        this.error = 'Username or password is incorrect';
        this.loading = false;
      }
    });
  }

}
