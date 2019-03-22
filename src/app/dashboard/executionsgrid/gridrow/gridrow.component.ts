import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { PluginExecution, WorkflowExecutionSummary } from '../../../_models';
import { copyExecutionAndTaskId, statusClassFromPlugin } from '../../../_helpers';

@Component({
  selector: 'app-gridrow',
  templateUrl: './gridrow.component.html',
  styleUrls: ['./gridrow.component.scss'],
})
export class GridrowComponent {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<HTMLElement>;
  @Input() dsExecution: WorkflowExecutionSummary;
  @Output() closeExpanded: EventEmitter<void> = new EventEmitter();

  expanded: boolean;
  contentCopied = false;
  constructor() {}

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  getPluginStatusClass(plugin: PluginExecution): string {
    return statusClassFromPlugin(plugin, plugin);
  }

  toggleExpand(e: { target: HTMLInputElement }): void {
    if (e.target.nodeName === 'A') {
      return;
    }
    let expanded = this.expanded;
    this.closeExpanded.emit();
    this.expanded = !expanded;
  }
}
