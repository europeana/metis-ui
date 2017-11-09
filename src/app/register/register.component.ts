import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { FlashMessagesService } from 'angular2-flash-messages';
import { StringifyHttpError, MatchPassword } from '../_helpers';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  loading = false;
  error = '';
  public password = '';

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authentication: AuthenticationService,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group({
        password: ['', Validators.required ],
        confirm: ['', Validators.required ]
      }, {
        validator: MatchPassword
      })
    });
  }

  onKeyupPassword() {
    this.password = this.registerForm.controls.passwords.get('password').value;
    console.log(this.password);
  }

  onSubmit() {
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;

    this.authentication.register(email, password).subscribe(result => {
      if (result === true) {
        this.onRegistration();
      } else {
        this.error = 'Registration failed: please try again later';
      }
      this.loading = false;
    },
     (err: HttpErrorResponse) => {
      if (err.status === 201 ) {
        // Bug in HttpClient, a 201 is returned as error for some reason.
        this.onRegistration();
      } else {
        this.error = `Registration failed: ${StringifyHttpError(err)}`;
        this.loading = false;
      }
    });
  }

  private onRegistration() {
    this.flashMessage.show('Registration successful, please log in!', { cssClass: 'alert-success', timeout: 5000 });
    this.router.navigate(['/login']);
  }
}

