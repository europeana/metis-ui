import { Component, Input } from '@angular/core';

import { PasswordStrength } from '../../_helpers';

const COLORS = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];
const TEXTS = ['Very bad', 'Bad', 'Weak', 'Good', 'Strong'];

@Component({
  selector: 'app-password-check',
  templateUrl: './password-check.component.html',
  styleUrls: ['./password-check.component.scss']
})
export class PasswordCheckComponent {
  info = false;
  index = 0;

  @Input()
  set passwordToCheck(value: string) {
    const strength = PasswordStrength(value || '');
    if (strength <= 10) {
      this.index = 0;
    } else if (strength <= 20) {
      this.index = 1;
    } else if (strength <= 30) {
      this.index = 2;
    } else if (strength <= 40) {
      this.index = 3;
    } else {
      this.index = 4;
    }
  }

  /** getBarColor
  /* maps the specified numeric parameter to a colour
  */
  getBarColor(i: number): string {
    if (i <= this.index) {
      return COLORS[this.index];
    } else {
      return '#ddd';
    }
  }

  /** getStrength
  /* return the text for this index
  */
  getStrength(): string {
    return TEXTS[this.index];
  }

  /** toggleInfo
  /* toggles the value of the info variable
  */
  toggleInfo(): void {
    this.info = !this.info;
  }
}
