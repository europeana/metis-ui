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
  errorMessage?: string;
  successMessage: string;
  notfoundMessage: string;
  linkRegister: string = environment.links.registerMetis;
  msgSuccess: string;
  msgPasswordWeak: string;
  msgRegistrationFailed: string;
  msgAlreadyRegistered: string;

  public password?: string;

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
  ngOnInit(): void {
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
      this.msgSuccess = this.translate.instant('registrationsuccessful');
      this.msgPasswordWeak = this.translate.instant('passwordweakerror');
      this.msgRegistrationFailed = this.translate.instant('registrationfailed');
      this.msgAlreadyRegistered = this.translate.instant('registrationalready');
    }
  }

  /** onKeyupPassword
  /* get password after keyup in form
  */
  onKeyupPassword(): void {
    this.password = this.registerForm.controls.passwords.get('password')!.value;
  }

  /** onSubmit
  /* submit registration form
  /* check if passwords do match
  /* and are strict
  */
  onSubmit(): void {
    this.errorMessage = undefined;
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password')!.value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    if (strength <= min) {
      this.errorMessage = this.msgPasswordWeak;
      this.loading = false;
    } else {
      this.authentication.register(email, password).subscribe(result => {
        if (result === true) {
          this.onRegistration(this.msgSuccess);
        }
      }, (err: HttpErrorResponse) => {
        this.errorMessage = `${StringifyHttpError(err)}`;
      });
      this.loading = false;
    }
  }

  /** onRegistration
  /* set message after successful registration
  /* redirect user to signin page afterwards
  /* @param {string} msg - success message
  */
  private onRegistration(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 3000);
  }
}

