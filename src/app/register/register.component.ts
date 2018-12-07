import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { MatchPasswordValidator, PasswordStrength } from '../_helpers';
import {
  errorNotification,
  httpErrorNotification,
  Notification,
  successNotification,
} from '../_models/notification';
import { AuthenticationService } from '../_services';
import { TranslateService } from '../_translate';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  loading = false;
  notification?: Notification;
  msgSuccess: string;
  msgPasswordWeak: string;
  msgRegistrationFailed: string;
  msgAlreadyRegistered: string;
  registerForm: FormGroup;
  timeout?: number;

  public password?: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authentication: AuthenticationService,
    private translate: TranslateService,
  ) {}

  /** ngOnInit
  /* init for this component
  /* create a registration form
  /* set translation language
  */
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group(
        {
          password: ['', Validators.required],
          confirm: ['', Validators.required],
        },
        {
          validator: MatchPasswordValidator,
        },
      ),
    });

    this.translate.use('en');
    this.msgSuccess = this.translate.instant('registrationsuccessful');
    this.msgPasswordWeak = this.translate.instant('passwordweakerror');
    this.msgRegistrationFailed = this.translate.instant('registrationfailed');
    this.msgAlreadyRegistered = this.translate.instant('registrationalready');
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);
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
    this.notification = undefined;
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password')!.value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    if (strength <= min) {
      this.notification = errorNotification(this.msgPasswordWeak);
      this.loading = false;
    } else {
      this.authentication.register(email, password).subscribe(
        (result) => {
          this.loading = false;
          if (result) {
            this.onRegistration(this.msgSuccess);
          }
        },
        (err: HttpErrorResponse) => {
          this.loading = false;
          this.notification = httpErrorNotification(err);
        },
      );
    }
  }

  /** onRegistration
  /* set message after successful registration
  /* redirect user to signin page afterwards
  /* @param {string} msg - success message
  */
  private onRegistration(msg: string): void {
    this.notification = successNotification(msg);
    this.timeout = window.setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 3000);
  }
}
