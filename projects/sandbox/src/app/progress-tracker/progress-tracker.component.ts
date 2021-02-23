import { Component, Input } from '@angular/core';
import { DatasetInfo, ProgressByStep } from '../_models';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent {
  @Input() progressData: DatasetInfo;
  @Input() datasetId: number;

  /** getLabelClass
  /* return a css class based on the plugin status
  */
  getLabelClass(step: string): string {
    console.log('datasetId ' + this.datasetId);
    const plugin = step
      .trim()
      .replace('import', 'harvest')
      .replace('enrich', 'enrichment')
      .replace('normalise', 'normalization')
      .replace('process media', 'media_process')
      .replace('transform', 'transformation')
      .replace('validate (edm external)', 'validation_external')
      .replace('validate (edm internal)', 'validation_internal');
    return `${plugin.toString().toLowerCase()}`;
  }

  /** getStatusClass
  /* return a css class based on the plugin status
  */
  getStatusClass(step: ProgressByStep): string {
    return step.total === step.success ? 'success' : step.fail > 0 ? 'fail' : 'warn';
  }
}
