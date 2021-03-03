import { Component, Input } from '@angular/core';
import { DatasetInfo, ProgressByStep, StepStatus, StepStatusClass } from '../_models';

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
  getLabelClass(step: StepStatus): string {
    const labelClass = StepStatusClass.get(step);
    return labelClass ? labelClass : '';
  }

  /** getStatusClass
  /* return a css class based on the plugin status
  */
  getStatusClass(step: ProgressByStep): string {
    return step.total === step.success ? 'success' : step.fail > 0 ? 'fail' : 'warn';
  }
}
