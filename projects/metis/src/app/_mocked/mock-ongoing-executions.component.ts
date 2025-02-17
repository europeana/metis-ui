import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PluginExecution, WorkflowExecution } from '../_models';

@Component({
  selector: 'app-ongoingexecutions',
  template: ''
})
export class MockOngoingExecutionsComponent {
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();
  @Input() showPluginLog: PluginExecution;
  @Input() runningExecutions: Array<WorkflowExecution>;
  @Input() selectedExecutionDsId: string;
}
