import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { FlashMessagesService } from 'angular2-flash-messages';
import { StringifyHttpError } from '../_helpers';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthenticationService]
})
export class LoginComponent implements OnInit {
  loading = false;
  error = '';
  returnUrl: string;
  loginForm: FormGroup;

  constructor(
    // private route: ActivatedRoute,
    private router: Router,
    private authentication: AuthenticationService,
    private redirectPreviousUrl: RedirectPreviousUrl,
    private fb: FormBuilder,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {

    // reset login status
    this.authentication.logout();

    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email] ],
      'password': ['', Validators.required ]
    });

  }

  onSubmit() {

    const msg_bad_credentials = 'Email or password is incorrect, please try again.';
    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;

    this.loading = true;

    this.authentication.login(email, password).subscribe(result => {

      if (result === true) {
        const url = this.redirectPreviousUrl.get();
        this.flashMessage.show('Login successful, have fun!', { cssClass: 'alert-success', timeout: 5000 });
        if (url) {
          this.router.navigateByUrl(`/${url}`);
        } else {
          this.router.navigate([environment.afterLoginGoto]);
        }
      } else {
        this.error = msg_bad_credentials;
      }
      this.loading = false;

    },
    (err: HttpErrorResponse) => {

      if (err.status === 406) {
        this.error = msg_bad_credentials;
      } else {
        this.error = `Login failed: ${StringifyHttpError(err)}`;
      }
      
      this.loading = false;
    });

  }

}
