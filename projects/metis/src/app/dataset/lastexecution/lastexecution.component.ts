import { Component, EventEmitter, Input, Output } from '@angular/core';
import { statusClassFromPlugin } from '../../_helpers';
import {
  getCurrentPlugin,
  isWorkflowCompleted,
  PluginExecution,
  Report,
  SimpleReportRequest,
  WorkflowExecution
} from '../../_models';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html'
})
export class LastExecutionComponent {
  @Input() datasetId: string;
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();

  report?: Report;
  pluginExecutions: PluginExecution[] = [];
  currentPlugin?: PluginExecution;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      if (isWorkflowCompleted(value)) {
        this.currentPlugin = undefined;
      } else {
        this.currentPlugin = getCurrentPlugin(value);
      }
      this.pluginExecutions = value.metisPlugins.slice();
      this.pluginExecutions.reverse();
    }
  }

  /** scroll
  /* scroll to specific point in page after click
  */
  scroll(el: Element): void {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  /** openFailReport
  /* open the fail report
  */
  openFailReport(req: SimpleReportRequest): void {
    this.setReportMsg.emit(req);
  }

  /** getPluginStatusClass
  /* calculate which css class to use
  */
  getPluginStatusClass(plugin: PluginExecution): string {
    return statusClassFromPlugin(plugin, this.currentPlugin);
  }
}
