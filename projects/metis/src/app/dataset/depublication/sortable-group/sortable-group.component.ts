import { Component, input, output, viewChildren } from '@angular/core';
import { SortHeaderGroupConf, SortParameter } from '../../../_models';
import { SortableHeaderComponent } from '../sortable-header';

@Component({
  selector: 'app-sortable-group',
  templateUrl: './sortable-group.component.html',
  imports: [SortableHeaderComponent]
})
export class SortableGroupComponent {
  readonly headers = viewChildren(SortableHeaderComponent);
  readonly grpConf = input.required<SortHeaderGroupConf>();
  readonly selectAllDisabled = input<boolean>(false);
  readonly allSelected = input<boolean>(false);

  readonly groupSet = output<SortParameter>();
  readonly selectedAll = output<boolean>();

  /** onSetHandler
  /* call reset on headers, transmit sort event to parent
  /*  @param {SortParameter} event - the captured sort event
  */
  onSetHandler(event: SortParameter): void {
    this.headers().forEach((h) => {
      h.reset();
    });
    this.groupSet.emit(event);
  }

  selectAllHandler(val: boolean): void {
    this.selectedAll.emit(val);
  }
}
