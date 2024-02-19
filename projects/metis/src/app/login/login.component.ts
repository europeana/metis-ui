import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';
import { environment } from '../../environments/environment';
import { StringifyHttpError } from '../_helpers';
import { errorNotification, Notification } from '../_models';
import { Observable, of } from 'rxjs';
import { AuthenticationService, DocumentTitleService, RedirectPreviousUrl } from '../_services';
import { TranslateService } from '../_translate';
import { TranslatePipe } from '../_translate/translate.pipe';
import { LoadingButtonComponent } from '../shared/loading-button/loading-button.component';
import { NgIf } from '@angular/common';
import { NotificationComponent } from '../shared/notification/notification.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NotificationComponent,
    NgIf,
    LoadingButtonComponent,
    TranslatePipe
  ]
})
export class LoginComponent extends DataPollingComponent implements OnInit {
  loading = false;
  notification?: Notification;
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  msgBadCredentials: string;
  msgSigninFailed: string;

  constructor(
    private readonly router: Router,
    private readonly authentication: AuthenticationService,
    private readonly redirectPreviousUrl: RedirectPreviousUrl,
    private readonly formBuilder: NonNullableFormBuilder,
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
    this.documentTitleService.setTitle(this.translate.instant('signIn'), true);
    this.msgBadCredentials = this.translate.instant('msgBadCredentials');
    this.msgSigninFailed = this.translate.instant('msgSigninFailed');

    this.createNewDataPoller(
      environment.intervalStatusMedium,
      (): Observable<boolean> => {
        return of(this.authentication.validatedUser());
      },
      false,
      (result: boolean): void => {
        if (result) {
          this.redirectAfterLogin();
        } else {
          this.authentication.logout();
        }
      }
    );
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

    this.subs.push(
      this.authentication
        .login(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
        .subscribe({
          next: (result) => {
            if (result) {
              this.redirectAfterLogin();
            } else {
              this.notification = errorNotification(this.msgBadCredentials);
            }
            this.loading = false;
          },
          error: (err: HttpErrorResponse) => {
            this.notification = errorNotification(
              [406, 401, undefined].includes(err.status)
                ? this.msgBadCredentials
                : `${this.msgSigninFailed}: ${StringifyHttpError(err)}`
            );
            this.loading = false;
          }
        })
    );
  }

  /** redirectAfterLogin
  /* redirect to previous page after login or default page
  */
  redirectAfterLogin(): void {
    const url = this.redirectPreviousUrl.get();
    if (url && url !== '/signin') {
      this.redirectPreviousUrl.set(undefined);
      this.router.navigateByUrl(`/${url}`);
    } else {
      this.router.navigate([environment.afterLoginGoto]);
    }
  }
}
