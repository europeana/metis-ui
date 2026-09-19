/** Simple component to display user information **/
import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-username',
  standalone: true,
  templateUrl: './username.component.html',
  imports: [TranslatePipe]
})
export class UsernameComponent {
  public readonly firstName = input<string | undefined>();
  public readonly lastName = input<string | undefined>();
  public readonly userName = input<string | undefined>();
  public readonly userId = input<string | undefined>();
}
