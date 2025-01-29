import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckboxComponent } from 'shared';
import { SortDirection, SortHeaderConf, SortParameter } from '../../../_models';
import { TranslatePipe } from '../../../_translate';

@Component({
  templateUrl: './sortable-header.component.html',
  selector: 'app-sortable-header',
  styleUrls: ['./sortable-header.component.scss'],
  imports: [CheckboxComponent, NgIf, TranslatePipe]
})
export class SortableHeaderComponent {
  isLocked = false;
  statuses = Object.values(SortDirection);
  classes = this.statuses.map((status: string) => 'sort-' + status.toLowerCase());
  current = 0;

  @Input() allSelected: boolean;
  @Input() selectAllDisabled: boolean;
  @Input() conf: SortHeaderConf;
  @Output() onSet = new EventEmitter<SortParameter>();
  @Output() onSelectAll = new EventEmitter<boolean>();

  valueBump(): void {
    this.current = this.current + 1;
    if (this.current === this.classes.length) {
      this.current = 0;
    }
    this.isLocked = true;
    this.onSet.emit({
      field: this.conf.fieldName,
      direction: this.statuses[this.current]
    } as SortParameter);
    this.isLocked = false;
  }

  reset(): void {
    if (!this.isLocked) {
      this.current = 0;
    }
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.onSelectAll.emit(this.allSelected);
  }
}
