import { AbstractControl } from '@angular/forms';
import { PasswordStrength } from './password-strength';
import { environment } from '../../environments/environment';

export function PasswordStrengthValidator(ac: AbstractControl) {
  let strength = 0;
  const min = environment.passwordStrength;
  const password = ac.get('password').value;
  console.log(password);
  if (password && password.length) {
    strength = PasswordStrength(password);
  }
  if (strength <= min) {
    ac.get('password').setErrors( {PasswordStrengthValidator: true} );
  } else {
    return null;
  }
}
