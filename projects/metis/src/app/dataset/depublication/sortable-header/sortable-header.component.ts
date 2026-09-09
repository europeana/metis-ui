import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { CheckboxComponent } from 'shared';
import { SortDirection, SortHeaderConf, SortParameter } from '../../../_models';
import { TranslatePipe } from '../../../_translate';

@Component({
  templateUrl: './sortable-header.component.html',
  selector: 'app-sortable-header',
  styleUrls: ['./sortable-header.component.scss'],
  imports: [CheckboxComponent, NgTemplateOutlet, TranslatePipe]
})
export class SortableHeaderComponent {
  readonly statuses = Object.values(SortDirection);
  readonly classes = this.statuses.map((status: string) => 'sort-' + status.toLowerCase());

  readonly current = signal<number>(0);
  readonly allSelectedState = signal<boolean>(false);
  private isLocked = false;

  readonly allSelected = input<boolean, boolean>(false, {
    transform: (v: boolean) => {
      this.allSelectedState.set(v);
      return v;
    }
  });

  readonly selectAllDisabled = input<boolean>(false);
  readonly conf = input.required<SortHeaderConf>();

  readonly sortSet = output<SortParameter>();
  readonly selectedAll = output<boolean>();

  readonly hostClasses = computed(() => {
    const configClass = this.conf()?.cssClass || '';
    const currentClass = this.classes[this.current()];
    return `${configClass} ${currentClass}`.trim();
  });

  valueBump(): void {
    let nextIndex = this.current() + 1;
    if (nextIndex === this.classes.length) {
      nextIndex = 0;
    }

    this.isLocked = true;
    this.current.set(nextIndex);

    this.sortSet.emit({
      field: this.conf().fieldName ?? '',
      direction: this.statuses[nextIndex]
    });
    this.isLocked = false;
  }

  reset(): void {
    if (!this.isLocked) {
      this.current.set(0);
    }
  }

  toggleSelectAll(): void {
    const newValue = !this.allSelectedState();
    this.allSelectedState.set(newValue);
    this.selectedAll.emit(newValue);
  }
}
