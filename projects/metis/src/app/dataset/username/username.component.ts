/** Simple component to display a User object's first and last names
 **/
import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { User } from '../../_models';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  imports: [NgIf, TranslatePipe]
})
export class UsernameComponent {
  @Input() user: User | null;
  public unknownUser = ({
    userId: 'unknown'
  } as unknown) as User;
}
