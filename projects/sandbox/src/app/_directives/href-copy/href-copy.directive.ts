import { Directive } from '@angular/core';

@Directive({
  selector: '[appHrefCopy]',
  exportAs: 'hrefCopy'
})
export class HrefCopyDirective {
  copied = false;
  timeToReset = 2000;

  copy(text?: string): void {
    if (text) {
      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = `${text}`;

      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();

      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.copied = true;

      const fn = (): void => {
        this.copied = false;
      };
      setTimeout(fn, this.timeToReset);
    }
  }
}
