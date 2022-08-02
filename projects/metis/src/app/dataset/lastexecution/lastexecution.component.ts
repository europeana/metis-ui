import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { statusClassFromPlugin } from '../../_helpers';
import {
  executionsIncludeDeleted,
  getCurrentPlugin,
  isWorkflowCompleted,
  PluginExecution,
  Report,
  ReportRequest,
  WorkflowExecution
} from '../../_models';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html'
})
export class LastExecutionComponent {
  @Input() datasetId: string;
  @Output() setReportMsg = new EventEmitter<ReportRequest | undefined>();

  report?: Report;
  pluginExecutions: PluginExecution[] = [];
  currentPlugin?: PluginExecution;
  isIncremental = false;
  containsDeleted = false;
  lastExecutionId: string;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      this.isIncremental = value.isIncremental;
      if (isWorkflowCompleted(value)) {
        this.currentPlugin = undefined;
      } else {
        this.currentPlugin = getCurrentPlugin(value);
      }
      this.lastExecutionId = value.id;
      this.pluginExecutions = value.metisPlugins.slice();
      this.pluginExecutions.reverse();
      this.containsDeleted = executionsIncludeDeleted(this.pluginExecutions);
    }
  }

  constructor(private readonly router: Router) {}

  fullHistoryLinkVisible(): boolean {
    return !this.router.isActive('/dataset/log', {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
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
  openFailReport(req: ReportRequest): void {
    Object.assign(req, { workflowExecutionId: this.lastExecutionId });
    this.setReportMsg.emit(req);
  }

  /** getPluginStatusClass
  /* calculate which css class to use
  /* @param { PluginExecution } plugin - the plugin to evaluate
  /* @return string
  */
  getPluginStatusClass(plugin: PluginExecution): string {
    return statusClassFromPlugin(plugin, this.currentPlugin);
  }
}
