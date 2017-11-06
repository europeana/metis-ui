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
      firstname: ['', Validators.required ],
      lastname: ['', Validators.required ],
      email: ['', [Validators.required, Validators.email]],
      'password-group': this.fb.group({
        password: ['', Validators.required ],
        'password-confirm': ['', Validators.required ]
      }, {
        validator: PasswordValidation.MatchPassword
      })
    });
  }

  onSubmit() {
    this.loading = true;
    const controls = this.registerForm.controls;
    const pw_controls = controls['password-group'].controls;
    const firstname = controls['firstname'].value;
    const lastname = controls['lastname'].value;
    const email = controls['email'].value;
    const password = controls['password'].value;
    const password_confirm = controls['password-confirm'].value;

    this.authentication.register(firstname, lastname, email, password, password_confirm).subscribe(result => {
      if (result === true) {
        this.router.navigate(['/registered']);
      } else {
        this.error = 'Cannot register, please try again at a later time';
        this.loading = false;
      }
    });

  }

  onReset(): void {
    this.registerForm.reset();
  }
}

export class PasswordValidation {

  constructor(private RegisterComponent: RegisterComponent) { }

  static MatchPassword(ac: AbstractControl) {
    if(ac.get('password').value !== ac.get('password-confirm').value) {
      ac.get('password-confirm').setErrors( {MatchPassword: true} );
    } else {
      return null;
    }
  }
}
