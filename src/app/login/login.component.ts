import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services';
import { HttpErrorResponse } from '@angular/common/http';
import { FlashMessagesService } from 'angular2-flash-messages';
import { StringifyHttpError } from '../_helpers';

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
    private fb: FormBuilder,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    // reset login status
    this.authentication.logout();

    // get return url from route parameters or default to '/'
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';

    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      'email': ['', [Validators.required, Validators.email] ],
      'password': ['', Validators.required ]
    });
  }

  onSubmit() {
    this.loading = true;
    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    this.authentication.login(email, password).subscribe(result => {
      if (result === true) {
        this.flashMessage.show('You are now logged in, have fun!', { cssClass: 'alert-success', timeout: 5000 });
        this.router.navigate(['/profile']);
        //this.router.navigateByUrl(this.returnUrl);
      } else {
        this.error = 'Email or password is incorrect';
      }
      this.loading = false;
    },
    (err: HttpErrorResponse) => {
      this.error = StringifyHttpError(err);
      this.loading = false;
    });
  }

}
