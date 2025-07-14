import { Component } from '@angular/core';
import { DebiasComponent } from '../debias';
import { SkipArrowsComponent } from '../skip-arrows';

@Component({
  standalone: true,
  selector: 'sb-dataset-info',
  template: ''
})
export class MockDatasetInfoComponent {
  isBusy = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  checkIfCanRunDebias(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pollDebiasReport(): void {}
  cmpDebias = ({
    skipArrows: ({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      pollDebiasReport(): void {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      skipToItem(): void {}
    } as unknown) as SkipArrowsComponent
  } as unknown) as DebiasComponent;
}
