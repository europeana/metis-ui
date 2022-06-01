import { Component, Input } from '@angular/core';
import { HarvestData, WorkflowExecution } from '../../_models';

@Component({
  selector: 'app-tab-headers',
  templateUrl: './tabheaders.component.html',
  styleUrls: ['./tabheaders.component.scss']
})
export class TabHeadersComponent {
  @Input() activeTab: string;
  @Input() datasetId?: string;
  @Input() disabled?: boolean;
  @Input() harvestData: HarvestData;
  @Input() lastExecution: WorkflowExecution;
}
