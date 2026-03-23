import { Component, Input } from '@angular/core';
import { PluginExecution, WorkflowExecution } from '../_models';

@Component({
  selector: 'app-ongoingexecutions',
  template: ''
})
export class MockOngoingExecutionsComponent {
  @Input() showPluginLog: PluginExecution;
  @Input() runningExecutions: Array<WorkflowExecution>;
  @Input() selectedExecutionDsId: string;
}
