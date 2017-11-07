import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../_services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  loading = false;
  error = '';

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authentication: AuthenticationService ) {
    this.createForm();
  }

  createForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      passwords: this.fb.group({
        password: ['', Validators.required ],
        confirm: ['', Validators.required ]
      }, {
        validator: PasswordValidation.MatchPassword
      })
    });
  }

  onSubmit() {
    this.loading = true;
    const controls = this.registerForm.controls;
    const email = controls.email.value;
    const passwords = controls.passwords;
    const password = passwords.get('password').value;

    this.authentication.register(email, password).subscribe(result => {
      if (result === true) {
        this.router.navigate(['/login']);
      } else {
        this.error = 'Cannot register, please try again at a later time';
        this.loading = false;
      }
    });

  }
}

export class PasswordValidation {

  constructor(private RegisterComponent: RegisterComponent) { }

  static MatchPassword(ac: AbstractControl) {
    if(ac.get('password').value !== ac.get('confirm').value) {
      ac.get('confirm').setErrors( {MatchPassword: true} );
    } else {
      return null;
    }
  }
}
