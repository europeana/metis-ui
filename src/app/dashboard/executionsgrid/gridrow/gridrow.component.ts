/** Single row of the overview of the dashboard executions
/*  - handles expansion to show full plugin breakdown
*/
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { DatasetOverview, PluginExecutionOverview } from '../../../_models';

@Component({
  selector: 'app-gridrow',
  templateUrl: './gridrow.component.html',
  styleUrls: ['./gridrow.component.scss']
})
export class GridrowComponent {
  @ViewChild('childComponentTemplate', { static: true }) childComponentTemplate: TemplateRef<
    HTMLElement
  >;
  @Input() dsExecution: DatasetOverview;
  @Input() expanded: boolean;
  @Output() closeExpanded: EventEmitter<string> = new EventEmitter();

  /** getPluginStatusClass
  /* return a css class based on the plugin status
  */
  getPluginStatusClass(plugin: PluginExecutionOverview): string {
    return `status-${plugin.pluginStatus.toString().toLowerCase()}`;
  }

  /** toggleExpand
  /* emit the close-expanded event unless the click target was a link
  */
  toggleExpand(e: { target: HTMLInputElement }): void {
    if (e.target.nodeName === 'A') {
      return;
    }
    this.closeExpanded.emit(this.expanded ? '' : this.dsExecution.execution.id);
  }
}
