import { Component, Input } from '@angular/core';

import { HarvestData, WorkflowExecution } from '../../_models';

@Component({
  selector: 'app-tab-headers',
  templateUrl: './tabheaders.component.html',
  styleUrls: ['./tabheaders.component.scss']
})
export class TabHeadersComponent {
  harvestPublicationData: HarvestData;
  activeTab: string;
  lastExecutionData: WorkflowExecution;

  @Input() disabled?: boolean;
  @Input() datasetId?: string;

  @Input()
  set harvestData(val: HarvestData) {
    this.harvestPublicationData = val;
  }

  @Input()
  set active(val: string) {
    this.activeTab = val;
  }

  @Input()
  set lastExecution(val: WorkflowExecution) {
    this.lastExecutionData = val;
  }
}
