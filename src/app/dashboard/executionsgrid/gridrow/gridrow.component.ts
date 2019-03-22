import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { copyExecutionAndTaskId, statusClassFromPlugin } from '../../../_helpers';
import { DatasetOverview, PluginExecution } from '../../../_models';

@Component({
  selector: 'app-gridrow',
  templateUrl: './gridrow.component.html',
  styleUrls: ['./gridrow.component.scss'],
})
export class GridrowComponent {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<HTMLElement>;
  @Input() dsExecution: DatasetOverview;
  @Input() expanded: boolean;
  @Input() index: number;

  @Output() closeExpanded: EventEmitter<number> = new EventEmitter();

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
    this.closeExpanded.emit(this.expanded ? -1 : this.index);
  }
}
