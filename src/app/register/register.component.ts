import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { FlashMessagesService } from 'angular2-flash-messages';
import { StringifyHttpError, MatchPasswordValidator, PasswordStrength } from '../_helpers';
import { environment } from '../../environments/environment';

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
        validator: MatchPasswordValidator
      })
    });
  }

  onKeyupPassword() {
    this.password = this.registerForm.controls.passwords.get('password').value;
  }

  onSubmit() {
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    const msg_successful = 'Registration successful, please log in!';

    console.log(`strength=${strength}, min=${min}`);

    if (strength <= min) {
      this.error = 'Password is too weak';
      this.loading = false;
    } else {
      this.authentication.register(email, password).subscribe(result => {
        if (result === true) {
          this.onRegistration(msg_successful);
        } else {
          this.error = 'Registration failed: please try again later';
        }
        this.loading = false;
      },
       (err: HttpErrorResponse) => {
        if (err.status === 201 ) {
          // Bug in HttpClient, a 201 is returned as error for some reason.
          this.onRegistration(msg_successful);
        } else if (err.status === 404) {
          this.router.navigate(['/register/notfound']);
        } else {
          const errmsg = StringifyHttpError(err);
          if (errmsg.match(/409/) && errmsg.match(/already exists/)) {
            this.onRegistration('You are already registered, please login in!');
          } else {
            this.error = `Registration failed: ${errmsg}`;
          }
          this.loading = false;
        }
      });
    }
  }

  private onRegistration(msg) {
    this.flashMessage.show(msg, { cssClass: 'alert-success', timeout: 5000 });
    this.router.navigate(['/login']);
  }
}

