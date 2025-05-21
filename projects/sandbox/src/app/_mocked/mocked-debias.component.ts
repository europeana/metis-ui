import { Component } from '@angular/core';
import { DebiasReport } from '../_models';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'sb-debias',
  template: ''
})
export class MockDebiasComponent {
  isBusy = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pollDebiasReport(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchAndProcessReport(): void {}

  fetchReport(): Observable<DebiasReport> {
    return of(({} as unknown) as DebiasReport);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  processReport(_: DebiasReport, __?: string): void {}
}
