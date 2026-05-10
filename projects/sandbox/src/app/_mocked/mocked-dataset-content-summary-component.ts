import { Component, input } from '@angular/core';
// Import the real component so we can "pretend" to be it
import { DatasetContentSummaryComponent } from '../dataset-content-summary';

@Component({
  selector: 'sb-dataset-content-summary',
  standalone: true,
  template: '',
  providers: [
    {
      provide: DatasetContentSummaryComponent,
      useExisting: MockDatasetContentSummaryComponent
    }
  ]
})
export class MockDatasetContentSummaryComponent {
  // Remove .required() - this stops the NG0950 crash
  datasetId = input<string>();
  isVisible = input<boolean>();
  recordHighlightRequest = input<string | undefined>();

  loadData = vi.fn();
}
