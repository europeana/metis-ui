import { Component, input, output } from '@angular/core';
import { Dataset, HarvestData } from '../_models';

@Component({
  selector: 'app-datasetform',
  template: ''
})
export class MockDatasetFormComponent {
  datasetData = input.required<Partial<Dataset>>();
  harvestPublicationData = input<HarvestData | undefined>(undefined);
  isNew = input<boolean>(false);
  datasetUpdated = output<void>();
}
