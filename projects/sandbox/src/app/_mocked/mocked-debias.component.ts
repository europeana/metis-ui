import { Component, ModelSignal } from '@angular/core';
import { DebiasInfo } from '../_models';

@Component({
  selector: 'sb-debias',
  template: ''
})
export class MockDebiasComponent {
  isBusy = false;

  pollDebiasReport(_: ModelSignal<DebiasInfo>): void {}

  reset(): void {}
}
