import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { SortableHeaderComponent } from '../sortable-header';
import { SortHeaderGroupConf, SortParameter } from '../../../_models';
import { SortableHeaderComponent as SortableHeaderComponent_1 } from '../sortable-header/sortable-header.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sortable-group',
  templateUrl: './sortable-group.component.html',
  standalone: true,
  imports: [NgFor, SortableHeaderComponent_1]
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
