import { Component } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';

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
      'firstname': ['', Validators.required ],
      'lastname': ['', Validators.required ],
      'email': ['', Validators.required ],
      'password': ['', Validators.required ]
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
