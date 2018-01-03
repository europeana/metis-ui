import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError, MatchPasswordValidator, PasswordStrength } from '../_helpers';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  
  loading = false;
  errorMessage: string;
  successMessage: string;
  notfoundMessage: string;
  linkRegister: string = environment.links.registerMetis;

  public password = '';

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authentication: AuthenticationService) { }

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
    this.errorMessage = '';
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    const msg_successful = 'Registration successful, you will be redirected to the login page!';

    if (strength <= min) {
      this.errorMessage = 'Password is too weak';
      this.loading = false;
    } else {
      this.authentication.register(email, password).subscribe(result => {
        if (result === true) {
          this.onRegistration(msg_successful);
        } else {
          this.errorMessage = 'Registration failed: please try again later';
        }
        this.loading = false;
      },
      (err: HttpErrorResponse) => {
        
        if (err.status === 201 ) {
          // Bug in HttpClient, a 201 is returned as error for some reason.
          this.onRegistration(msg_successful);
        } else if (err.status === 404 || err.status === 406) {
          
          let errmsg: string;
          try {
            const h = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            errmsg = h['errorMessage'];
          } catch (e) {
            console.error('RegisterComponent: JSON.parse(err.error) failed', err.error);
            errmsg = null;
          }
          this.notfoundMessage = errmsg || 'Unknown';

        } else if (err.status === 409) {
          this.onRegistration('You are already registered, you will be redirected to the login page!');
        } else {
          this.errorMessage = `Registration failed: ${StringifyHttpError(err)}`;
        }
        
        this.loading = false;
      });
    }
  }

  private onRegistration(msg) {
    this.successMessage = msg;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}

