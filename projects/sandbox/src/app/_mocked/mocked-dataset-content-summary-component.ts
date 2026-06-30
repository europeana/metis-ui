import { Component, input, signal } from '@angular/core';
// Import the real component so we can "pretend" to be it
import { DatasetContentSummaryComponent } from '../dataset-content-summary';

@Component({
  selector: 'sb-dataset-content-summary',
  standalone: true,
  template: '',
  // This helps the ViewChild signal find the mock
  providers: [
    { provide: DatasetContentSummaryComponent, useExisting: MockDatasetContentSummaryComponent }
  ]
})
export class MockDatasetContentSummaryComponent {
  datasetId = input<string>();
  isVisible = input<boolean>();
  recordHighlightRequest = input<string | undefined>();
  lastLoadedId = signal<string | undefined>(undefined);
  loadData = vi.fn();
}
