import { Component, OnChanges, Input, SimpleChange } from '@angular/core';
import { PasswordStrength } from '../../_helpers';

@Component({
  selector: 'app-password-check',
  templateUrl: './password-check.component.html',
  styleUrls: ['./password-check.component.scss']
})
export class PasswordCheckComponent implements OnChanges {
  @Input() passwordToCheck: string;

  bar0: string;
  bar1: string;
  bar2: string;
  bar3: string;
  bar4: string;

  public info = false;
  private colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];
  private strengths = ['Worst', 'Bad', 'Weak', 'Good', 'Strong'];

  strengthText = this.strengths[0];

  /** getColor
  /* find out which color to use
  /* @param {number} s - index number, used to catch color
  */
  private getColor(s) {
    let idx = 0;
    if (s <= 10) {
      idx = 0;
    } else if (s <= 20) {
      idx = 1;
    } else if (s <= 30) {
      idx = 2;
    } else if (s <= 40) {
      idx = 3;
    } else {
      idx = 4;
    }
    this.strengthText = this.strengths[idx];
    return {
      idx: idx + 1,
      col: this.colors[idx]
    };
  }

  /** ngOnChanges
  /* execute when component changes
  /* @param {object} changes - fields to watch for changes
  */
  ngOnChanges(changes: {[propName: string]: SimpleChange}): void {
    const password = changes['passwordToCheck'].currentValue;
    this.setBarColors(5, '#DDD');
    if (password) {
      const c = this.getColor(PasswordStrength(password));
      this.setBarColors(c.idx, c.col);
    }
  }

  /** setBarColors
  /* set colors of the bar to indicate password strength
  /* @param {number} count - strength
  /* @param {string} color - color of the bar
  */
  private setBarColors(count, col) {
    for (let _n = 0; _n < count; _n++) {
      this['bar' + _n] = col;
    }
  }

  /** toggleInfo
  /* toggle hinting/help
  */
  toggleInfo() {
    this.info = !this.info;
    return false;
  }
}
