import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortDirection, SortHeaderConf, SortParameter } from '../../../_models';

@Component({
  templateUrl: './sortable-header.component.html',
  selector: 'app-sortable-header',
  styleUrls: ['./sortable-header.component.scss']
})
export class SortableHeaderComponent {
  isLocked = false;
  statuses = Object.values(SortDirection);
  classes = this.statuses.map((status: string) => status.toLowerCase());
  current = 0;

  @Input() conf: SortHeaderConf;
  @Output() onSet = new EventEmitter<SortParameter>();

  valueBump(): void {
    this.current = this.current + 1;
    if (this.current === this.classes.length) {
      this.current = 0;
    }
    this.isLocked = true;
    this.onSet.emit({
      field: this.conf.fieldName,
      direction: this.statuses[this.current]
    });
    this.isLocked = false;
  }

  reset(): void {
    if (!this.isLocked) {
      this.current = 0;
    }
  }
}
