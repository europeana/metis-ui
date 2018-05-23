import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, RedirectPreviousUrl, TranslateService } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError } from '../_helpers';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage: string;
  successMessage: string;
  returnUrl: string;
  loginForm: FormGroup;
  msgBadCredentials: string;

  constructor(
    private router: Router,
    private authentication: AuthenticationService,
    private redirectPreviousUrl: RedirectPreviousUrl,
    private fb: FormBuilder,
    private translate: TranslateService) { }

  /** ngOnInit
  /* init of this component
  /* reset login status = logout
  /* create a login form
  /* set translation language
  */
  ngOnInit() {
   
    this.authentication.logout(); // 

    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email] ],
      'password': ['', Validators.required ]
    });

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.msgBadCredentials = this.translate.instant('msgbadcredentials');

    }
  }

  /** onSubmit
  /* submit login form
  */
  onSubmit() {
    const url = this.redirectPreviousUrl.get();
    this.loading = true;

    this.authentication.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value).subscribe(result => {
      if (result === true) {
        if (url) {
          this.router.navigateByUrl(`/${url}`);
          this.redirectPreviousUrl.set(undefined);
        } else {
          this.router.navigate([`${environment.afterLoginGoto}`]);
        }
      } else {
        this.errorMessage = this.msgBadCredentials;
      }
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      if (err.status === 406) {
        this.errorMessage = this.msgBadCredentials;
      } else {
        this.errorMessage = `Login failed: ${StringifyHttpError(err)}`;
      }      
      this.loading = false;
    });
  }

}
