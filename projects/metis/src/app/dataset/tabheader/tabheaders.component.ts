import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HarvestData, WorkflowExecution } from '../../_models';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-tab-headers',
  templateUrl: './tabheaders.component.html',
  styleUrls: ['./tabheaders.component.scss'],
  standalone: true,
  imports: [NgClass, RouterLink, NgIf, DatePipe, TranslatePipe]
})
export class TabHeadersComponent {
  @Input() activeTab: string;
  @Input() datasetId?: string;
  @Input() disabled?: boolean;
  @Input() harvestData: HarvestData;
  @Input() lastExecution: WorkflowExecution;
}
