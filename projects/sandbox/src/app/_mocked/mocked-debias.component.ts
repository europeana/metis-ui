import { Component } from '@angular/core';
@Component({
  standalone: true,
  selector: 'sb-debias',
  template: ''
})
export class MockDebiasComponent {
  isBusy = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pollDebiasReport(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resetSkipArrows(): void {}
}
