import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { copyExecutionAndTaskId } from '../../../_helpers';
import { WorkflowExecutionSummary } from '../../../_models';

@Component({
  selector: 'app-gridrow',
  templateUrl: './gridrow.component.html',
  styleUrls: ['./gridrow.component.scss'],
})
export class GridrowComponent {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<HTMLElement>;
  @Input() dsExecution: WorkflowExecutionSummary;

  expanded = true;
  contentCopied = false;
  constructor() {}

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  toggleExpand(e: { target: HTMLInputElement }): void {
    if (e.target.nodeName === 'A') {
      return;
    }
    this.expanded = !this.expanded;
  }
}
