/** Simple component to display a user information
 **/
import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  imports: [TranslatePipe]
})
export class UsernameComponent {
  @Input() firstName?: string;
  @Input() lastName?: string;
  @Input() userName?: string;
  @Input() userId?: string;
}
