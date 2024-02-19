import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { TranslatePipe } from '../../_translate/translate.pipe';
import { ExecutionsDataGridComponent } from '../executions-data-grid/executions-data-grid.component';
import { NgFor, NgTemplateOutlet, NgIf } from '@angular/common';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html',
  standalone: true,
  imports: [NgFor, ExecutionsDataGridComponent, NgTemplateOutlet, NgIf, RouterLink, TranslatePipe]
})
export class LastExecutionComponent {
  private readonly router = inject(Router);

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
    this.setReportMsg.emit({
      ...req,
      workflowExecutionId: this.lastExecutionId
    });
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
