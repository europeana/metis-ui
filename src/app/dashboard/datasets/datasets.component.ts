import { Component, Input } from '@angular/core';

import { Dataset } from '../../_models';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html'
})
export class DatasetsComponent {
  @Input() datasets: Dataset[];

  /** byId
  /* return the id of the specified item
  */
  byId(_: number, item: Dataset): string {
    return item.id;
  }
}
