import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { StringifyHttpError } from '../_helpers';
import { errorNotification, Notification } from '../_models';
import { AuthenticationService, DocumentTitleService, RedirectPreviousUrl } from '../_services';
import { TranslateService } from '../_translate';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loading = false;
  notification?: Notification;
  loginForm: FormGroup;
  msgBadCredentials: string;
  checkLogin = true;

  constructor(
    private readonly router: Router,
    private readonly authentication: AuthenticationService,
    private readonly redirectPreviousUrl: RedirectPreviousUrl,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly documentTitleService: DocumentTitleService
  ) {}

  /** ngOnInit
  /* init of this component
  /* reset login status = logout
  /* create a login form
  /* set translation language
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Sign In');

    // already logged in, then redirect
    if (this.authentication.validatedUser() && this.checkLogin) {
      this.redirectAfterLogin();
      return;
    }

    // else make sure the user is logged out properly and show the form
    this.authentication.logout();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.msgBadCredentials = this.translate.instant('msgBadCredentials');
  }

  /** onSubmit
  /* submit login form
  */
  onSubmit(): void {
    if (
      this.loginForm.controls.email.value === '' ||
      this.loginForm.controls.password.value === ''
    ) {
      return;
    }

    this.loading = true;

    // already logged in, then redirect
    if (this.authentication.validatedUser() && this.checkLogin) {
      this.checkLogin = true;
      this.redirectAfterLogin();
      return;
    }

    this.authentication
      .login(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
      .subscribe(
        (result) => {
          if (result) {
            this.redirectAfterLogin();
          } else {
            this.notification = errorNotification(this.msgBadCredentials);
          }
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          this.notification = errorNotification(
            err.status === 406
              ? this.msgBadCredentials
              : `Signin failed: ${StringifyHttpError(err)}`
          );
          this.loading = false;
        }
      );
  }

  /** redirectAfterLogin
  /* redirect to previous page after login or default page
  */
  redirectAfterLogin(): void {
    const url = this.redirectPreviousUrl.get();

    if (url && url !== '/signin') {
      this.router.navigateByUrl(`/${url}`);
      this.redirectPreviousUrl.set(undefined);
    } else {
      this.router.navigate([environment.afterLoginGoto]);
    }
  }
}
