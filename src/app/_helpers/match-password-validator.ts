import { AbstractControl } from '@angular/forms';

export function MatchPasswordValidator(ac: AbstractControl) {
  if (ac.get('password').value !== ac.get('confirm').value) {
    ac.get('confirm').setErrors( {MatchPasswordValidator: true} );
  } else {
    return null;
  }
}
