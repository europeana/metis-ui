import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HarvestData, WorkflowExecution } from '../../_models';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-tab-headers',
  standalone: true,
  templateUrl: './tabheaders.component.html',
  styleUrls: ['./tabheaders.component.scss'],
  imports: [NgClass, RouterLink, DatePipe, TranslatePipe]
})
export class TabHeadersComponent {
  public readonly activeTab = input.required<string>();
  public readonly datasetId = input<string | undefined>();
  public readonly disabled = input<boolean>(false);
  public readonly harvestData = input<HarvestData | undefined>();
  public readonly lastExecution = input<WorkflowExecution | undefined>();

  protected readonly datasetUrlPrefix = computed(() => {
    const id = this.datasetId();
    return id ? `/dataset/` : null;
  });

  readonly tabConfig = [
    { path: 'edit', labelKey: 'datasetInformation' },
    { path: 'workflow', labelKey: 'workflow' },
    { path: 'depublication', labelKey: 'depublication' },
    { path: 'mapping', labelKey: 'mapping' },
    { path: 'preview', labelKey: 'rawXml' },
    { path: 'log', labelKey: 'processingHistory' }
  ];
}
