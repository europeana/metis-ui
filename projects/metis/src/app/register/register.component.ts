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
import { SubscriptionManager } from 'shared';
import { timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatchPasswordValidator, PasswordStrength } from '../_helpers';
import {
  errorNotification,
  httpErrorNotification,
  Notification,
  successNotification
} from '../_models';
import { AuthenticationService, DocumentTitleService } from '../_services';
import { TranslateService } from '../_translate';
import { TranslatePipe } from '../_translate/translate.pipe';
import { LoadingButtonComponent } from '../shared/loading-button/loading-button.component';
import { PasswordCheckComponent } from '../shared/password-check/password-check.component';
import { NgIf } from '@angular/common';
import { NotificationComponent } from '../shared/notification/notification.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NotificationComponent,
    NgIf,
    PasswordCheckComponent,
    LoadingButtonComponent,
    TranslatePipe
  ]
})
export class RegisterComponent extends SubscriptionManager implements OnInit {
  loading = false;
  notification?: Notification;
  msgSuccess: string;
  msgPasswordWeak: string;
  msgRegistrationFailed: string;
  msgAlreadyRegistered: string;
  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    passwords: this.formBuilder.group(
      {
        password: ['', Validators.required],
        confirm: ['', Validators.required]
      },
      {
        validators: MatchPasswordValidator
      }
    )
  });

  public password?: string;

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly router: Router,
    private readonly authentication: AuthenticationService,
    private readonly translate: TranslateService,
    private readonly documentTitleService: DocumentTitleService
  ) {
    super();
  }

  /** ngOnInit
  /* init for this component
  /* create a registration form
  /* set translation language
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Register');
    this.msgSuccess = this.translate.instant('registrationSuccessful');
    this.msgPasswordWeak = this.translate.instant('userPasswordWeakError');
    this.msgRegistrationFailed = this.translate.instant('registrationFailed');
    this.msgAlreadyRegistered = this.translate.instant('registrationAlready');
  }

  /** onKeyupPassword
  /* get password after keyup in form
  */
  onKeyupPassword(): void {
    this.password = this.registerForm.controls.passwords.controls.password.value;
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
    const password = passwords.controls.password.value;
    const strength = PasswordStrength(password);
    const min = environment.passwordStrength;

    if (strength <= min) {
      this.notification = errorNotification(this.msgPasswordWeak);
      this.loading = false;
    } else {
      this.subs.push(
        this.authentication.register(email, password).subscribe({
          next: (result) => {
            this.loading = false;
            if (result) {
              this.onRegistration(this.msgSuccess);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.loading = false;
            this.notification = httpErrorNotification(err);
          }
        })
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
    const navigateTimer = timer(3000).subscribe({
      next: () => {
        navigateTimer.unsubscribe();
        this.router.navigate(['/signin']);
      }
    });
  }
}
