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
  @ViewChildren(SortableHeaderComponent) headers: QueryList<SortableHeaderComponent>;
  @ViewChild('sortableGroupTemplate') sortableGroupTemplate: TemplateRef<HTMLElement>;

  @Output() onGroupSet: EventEmitter<SortParameter> = new EventEmitter();
  @Input() grpConf: SortHeaderGroupConf;

  /** onSetHandler
  /* call reset on headers, transmit sort event to parent
  /*  @param {SortParameter} event - the captured sort event
  */
  onSetHandler(event: SortParameter) {
    this.headers.forEach((h) => {
      h.reset();
    });
    this.onGroupSet.emit(event);
  }
}
