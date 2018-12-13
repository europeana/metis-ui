import { Component, EventEmitter, Input, Output } from '@angular/core';

import { getCurrentPluginIndex, Workflow, WorkflowExecution, WorkflowStatus } from '../../_models';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss'],
})
export class GeneralactionbarComponent {
  constructor() {}

  @Input() datasetId: string;
  @Input() workflowData?: Workflow;
  @Input() isStarting = false;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      this.workflowStatus = value.workflowStatus;
      this.currentPluginIndex = getCurrentPluginIndex(value);
      this.totalPlugins = value.metisPlugins.length;
      this.pluginPercentage = (this.currentPluginIndex / this.totalPlugins) * 100;
    }
  }

  @Output() startWorkflow = new EventEmitter<void>();

  workflowStatus?: WorkflowStatus;
  currentPluginIndex = 0;
  totalPlugins = 0;
  pluginPercentage = 0;
}
