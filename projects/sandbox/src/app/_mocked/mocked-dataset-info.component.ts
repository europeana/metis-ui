import { Component, input, signal } from '@angular/core';
import { of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'sb-dataset-info',
  template: ''
})
export class MockDatasetInfoComponent {
  // Use a signal for fields changed at runtime to prevent NG0103 / timing bugs
  isBusy = signal(false);
  progressData = input<any>(null);
  datasetId = input<string | undefined>(undefined);
  pushHeight = input(false);
  modalIdPrefix = input('');

  checkIfCanRunDebias(): void {}
  pollDebiasReport() {
    return of({ status: 'success' }); // Prevents subscription hanging or errors
  }

  // If the parent checks properties inside cmpDebias or skipArrows reactively,
  // stub them using plain objects containing spy placeholders or simple tracking properties
  cmpDebias = {
    skipArrows: {
      skipToItem(): void {},
      pollDebiasReport() {
        return of({ status: 'success' }); // Prevents subscription hanging or errors
      }
    }
  } as any;
}
