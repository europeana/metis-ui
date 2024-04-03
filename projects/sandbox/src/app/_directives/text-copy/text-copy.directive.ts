import { Directive } from '@angular/core';

@Directive({
  selector: '[appTextCopy]',
  exportAs: 'textCopy'
})
export class TextCopyDirective {
  copied = false;
  timeToReset = 2000;

  copy(text?: string): void {
    if (text) {
      navigator.clipboard.writeText(text);
      this.copied = true;
      const fn = (): void => {
        this.copied = false;
      };
      setTimeout(fn, this.timeToReset);
    }
  }
}
