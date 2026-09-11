import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
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
import { TranslatePipe } from '../../_translate';
import { ExecutionsDataGridComponent } from '../executions-data-grid';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html',
  imports: [ExecutionsDataGridComponent, NgTemplateOutlet, RouterLink, TranslatePipe]
})
export class LastExecutionComponent {
  private readonly router = inject(Router);

  datasetId = input.required<string>();
  lastExecutionData = input<WorkflowExecution | undefined>(undefined);
  setReportMsg = output<ReportRequest | undefined>();

  report = signal<Report | undefined>(undefined);

  isIncremental = computed<boolean>(() => this.lastExecutionData()?.isIncremental ?? false);
  lastExecutionId = computed<string>(() => this.lastExecutionData()?.id ?? '');

  currentPlugin = computed<PluginExecution | undefined>(() => {
    const value = this.lastExecutionData();
    if (!value) return undefined;
    return isWorkflowCompleted(value) ? undefined : getCurrentPlugin(value);
  });

  pluginExecutions = computed<PluginExecution[]>(() => {
    const value = this.lastExecutionData();
    if (!value) return [];
    return [...value.metisPlugins].reverse();
  });

  containsDeleted = computed<boolean>(() => executionsIncludeDeleted(this.pluginExecutions()));

  fullHistoryLinkVisible = computed<boolean>(() => {
    return !this.router.isActive('/dataset/log', {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  });

  /** scroll
   * scroll to specific point in page after click
   */
  scroll(el: Element): void {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  /** openFailReport
   * open the fail report
   */
  openFailReport(req: ReportRequest): void {
    this.setReportMsg.emit({
      ...req,
      workflowExecutionId: this.lastExecutionId()
    });
  }

  /** getPluginStatusClass
   * calculate which css class to use
   * @param { PluginExecution } plugin - the plugin to evaluate
   * @return string
   */
  getPluginStatusClass(plugin: PluginExecution): string {
    return statusClassFromPlugin(plugin, this.currentPlugin());
  }
}
