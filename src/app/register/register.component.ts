import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, TranslateService } from '../_services';
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

  public password;

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authentication: AuthenticationService,
    private translate: TranslateService) { }

  /** ngOnInit
  /* init for this component
  /* create a registration form
  /* set translation language
  */
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

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** onKeyupPassword
  /* get password after keyup in form
  */
  onKeyupPassword() {
    this.password = this.registerForm.controls.passwords.get('password').value;
  }

  /** onSubmit
  /* submit registration form
  /* check if passwords do match
  /* and are strict
  */
  onSubmit() {
    this.errorMessage = undefined;
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    const msg_successful = this.translate.instant('registrationsuccessful');

    if (strength <= min) {
      this.errorMessage = this.translate.instant('passwordweakerror');
      this.loading = false;
    } else {
      this.authentication.register(email, password).subscribe(result => {
        if (result === true) {
          this.onRegistration(msg_successful);
        } else {
          this.errorMessage = this.translate.instant('registrationfailed');
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
            errmsg = null;
          }
          this.notfoundMessage = errmsg || 'Unknown';

        } else if (err.status === 409) {
          this.onRegistration(this.translate.instant('registrationalready'));
        } else {
          this.errorMessage = `${StringifyHttpError(err)}`;
        }
        
        this.loading = false;
      });
    }
  }

  /** onRegistration
  /* set message after successful registration
  /* redirect user to login page afterwards
  /* @param {string} msg - success message
  */
  private onRegistration(msg) {
    this.successMessage = msg;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}

