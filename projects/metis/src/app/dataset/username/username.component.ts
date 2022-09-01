/** Simple component to display a User object's first and last names
 **/
import { Component, Input } from '@angular/core';
import { User } from '../../_models';
import { AuthenticationService } from '../../_services';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html'
})
export class UsernameComponent {
  @Input() user: User | null;
  public unknownUser = AuthenticationService.unknownUser;
}
