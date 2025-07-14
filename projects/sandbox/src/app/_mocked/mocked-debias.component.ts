import { Component, ModelSignal } from '@angular/core';
import { DebiasInfo } from '../_models';

@Component({
  selector: 'sb-debias',
  template: ''
})
export class MockDebiasComponent {
  isBusy = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pollDebiasReport(_: ModelSignal<DebiasInfo>): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset(): void {}
}
