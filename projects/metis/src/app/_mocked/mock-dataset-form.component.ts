import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dataset, HarvestData } from '../_models';

@Component({
  selector: 'app-datasetform',
  standalone: true
})
export class MockDatasetFormComponent {
  @Input() datasetData: Partial<Dataset>;
  @Input() harvestPublicationData?: HarvestData;
  @Input() isNew: boolean;
  @Output() datasetUpdated = new EventEmitter<void>();
}
