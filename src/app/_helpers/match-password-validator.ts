import { AbstractControl } from '@angular/forms';

export function MatchPasswordValidator(ac: AbstractControl) {
  if (ac.get('password').value !== ac.get('confirm').value) {
    ac.get('confirm').setErrors( { MatchPasswordValidator: 'newnotmatch'} );
  } else if (ac.get('oldpassword') && (ac.get('oldpassword').value === ac.get('password').value)) {
    ac.get('password').setErrors( { MatchPasswordValidator: 'oldsamenew'} );
  } else {
    return null;
  }
}
