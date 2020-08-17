import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StringifyHttpError } from '../_helpers';
import { DataPollingComponent } from '../data-polling';
import { errorNotification, Notification } from '../_models';
import { Observable, of } from 'rxjs';
import { AuthenticationService, DocumentTitleService, RedirectPreviousUrl } from '../_services';
import { TranslateService } from '../_translate';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent extends DataPollingComponent implements OnInit {
  loading = false;
  notification?: Notification;
  loginForm: FormGroup;
  msgBadCredentials: string;
  msgSigninFailed: string;

  constructor(
    private readonly router: Router,
    private readonly authentication: AuthenticationService,
    private readonly redirectPreviousUrl: RedirectPreviousUrl,
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    private readonly documentTitleService: DocumentTitleService
  ) {
    super();
  }

  /** ngOnInit
  /* initialise translations
  /* create a login form
  /* listen for current logins
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Sign In');
    this.msgBadCredentials = this.translate.instant('msgBadCredentials');
    this.msgSigninFailed = this.translate.instant('msgSigninFailed');
    this.buildForm();

    // eslint-disable-next-line rxjs/no-ignored-observable
    this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<boolean> => {
        return of(this.authentication.validatedUser());
      },
      (result: boolean): void => {
        if (result) {
          this.redirectAfterLogin();
        } else {
          this.authentication.logout();
        }
      }
    );
  }

  /** buildForm
  /* build the login form
  */
  buildForm(): void {
    if (!this.loginForm) {
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      });
    }
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

    const subLogin = this.authentication
      .login(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
      .subscribe(
        (result) => {
          if (result) {
            this.redirectAfterLogin();
          } else {
            this.notification = errorNotification(this.msgBadCredentials);
          }
          this.loading = false;
          subLogin.unsubscribe();
        },
        (err: HttpErrorResponse) => {
          this.notification = errorNotification(
            err.status === 406
              ? this.msgBadCredentials
              : `${this.msgSigninFailed}: ${StringifyHttpError(err)}`
          );
          this.loading = false;
          subLogin.unsubscribe();
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
