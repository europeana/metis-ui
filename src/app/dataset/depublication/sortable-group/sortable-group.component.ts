import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { TemplateRef } from '@angular/core';
import { SortableHeaderComponent } from '../sortable-header';
import { SortHeaderGroupConf, SortParameter } from '../../../_models';

@Component({
  selector: 'app-sortable-group',
  templateUrl: './sortable-group.component.html'
})
export class SortableGroupComponent {
  _allSelected = false;
  @ViewChildren(SortableHeaderComponent) headers: QueryList<SortableHeaderComponent>;
  @ViewChild('sortableGroupTemplate', { static: true }) sortableGroupTemplate: TemplateRef<
    HTMLElement
  >;
  @Output() onGroupSet: EventEmitter<SortParameter> = new EventEmitter();
  @Output() onSelectAll: EventEmitter<boolean> = new EventEmitter();
  @Input() grpConf: SortHeaderGroupConf;
  @Input() selectAllDisabled: boolean;
  @Input() allSelected: boolean;

  /** onSetHandler
  /* call reset on headers, transmit sort event to parent
  /*  @param {SortParameter} event - the captured sort event
  */
  onSetHandler(event: SortParameter): void {
    this.headers.forEach((h) => {
      h.reset();
    });
    this.onGroupSet.emit(event);
  }

  selectAllHandler(val: boolean): void {
    this.onSelectAll.emit(val);
  }
}
