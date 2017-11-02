import { Component } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../_services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [AuthenticationService]
})

export class RegisterComponent {

  registerForm: FormGroup;
  errors: boolean;
  errorMessage: string;

  constructor(private authentication: AuthenticationService, private fb: FormBuilder) {
    this.authentication.redirectProfile();
    this.createForm();
  }

  createForm() {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required ],
      lastname: ['', Validators.required ],
      email: ['', [Validators.required, Validators.email]],
      password: this.fb.group({
        newPassword: ['', Validators.required ],
        repeatPassword: ['', Validators.required ]
      }, {
        validator: PasswordValidation.MatchPassword
      })
    });
  }

  onSubmit(): void {
    // this.errors = true;
    // this.errorMessage = "Error";
    console.log('submit');
  }

  onReset(): void {
    this.registerForm.reset();
  }
}

export class PasswordValidation {

  constructor(private RegisterComponent: RegisterComponent){ }

  static MatchPassword(ac: AbstractControl) {
    if(ac.get('newPassword').value !== ac.get('repeatPassword').value) {
      ac.get('repeatPassword').setErrors( {MatchPassword: true} );
    } else {
      return null;
    }
  }
}
