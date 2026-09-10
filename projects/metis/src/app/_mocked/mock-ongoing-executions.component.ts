import { Component, input } from '@angular/core';
import { WorkflowExecution } from '../_models';

@Component({
  selector: 'app-ongoingexecutions',
  template: ''
})
export class MockOngoingExecutionsComponent {
  readonly runningExecutions = input<WorkflowExecution[]>([]);
  readonly selectedExecutionDsId = input<string | undefined>();
}
