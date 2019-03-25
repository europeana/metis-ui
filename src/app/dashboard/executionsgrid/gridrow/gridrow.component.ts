import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { DatasetOverview, PluginExecutionOverview, PluginStatus } from '../../../_models';

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

  constructor() {}

  getPluginStatusClass(plugin: PluginExecutionOverview): string {
    if (
      plugin.progress.errors > 0 &&
      [PluginStatus.FINISHED, PluginStatus.CANCELLED].indexOf(plugin.pluginStatus) > -1
    ) {
      return 'status-warning';
    } else {
      return `status-${plugin.pluginStatus.toString().toLowerCase()}`;
    }
  }

  toggleExpand(e: { target: HTMLInputElement }): void {
    if (e.target.nodeName === 'A') {
      return;
    }
    this.closeExpanded.emit(this.expanded ? -1 : this.index);
  }
}
