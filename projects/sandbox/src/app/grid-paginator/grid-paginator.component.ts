import { NgIf } from '@angular/common';
import { Component, computed, effect, input, linkedSignal, output } from '@angular/core';
import { PagerInfo, TierSummaryRecord } from '../_models';

@Component({
  selector: 'sb-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss'],
  imports: [NgIf]
})
export class GridPaginatorComponent {
  rows = input.required<Array<TierSummaryRecord>>();
  maxPageSize = input<number>(10);
  change = output<PagerInfo>();

  pagesAndRanges = computed(() => {
    const ranges = Array.from(
      {
        length: Math.ceil(this.rows().length / this.maxPageSize())
      },
      (_, i: number) => {
        const lowerIndex = i * this.maxPageSize();
        const upperIndex = lowerIndex + this.maxPageSize();
        return [lowerIndex, upperIndex];
      }
    );
    return {
      pages: ranges.map((range: Array<number>) => {
        return this.rows().slice(range[0], range[1]);
      }),
      // store precise range structure, i.e. [[1,10],[11,20],[21,25]]
      ranges: ranges.map((range: Array<number>) => {
        return [range[0] + 1, Math.min(range[1], this.rows().length)];
      })
    };
  });

  totalPageCount = computed(() => {
    return this.pagesAndRanges().pages.length;
  });

  activePageIndex = linkedSignal({
    source: () => ({ r: this.rows(), s: this.maxPageSize() }),
    computation: () => 0
  });

  totalRows = computed(() => this.rows().length);

  constructor() {
    effect(() => {
      const index = this.activePageIndex();
      const data = this.pagesAndRanges();

      if (data) {
        this.change.emit({
          currentPage: index,
          pageCount: data.pages.length,
          pageRows: data.pages[index]
        });
      }
    });
  }

  canNext(): boolean {
    return this.activePageIndex() + 1 < this.totalPageCount();
  }

  canPrev(): boolean {
    return this.activePageIndex() > 0;
  }

  callSetPage(e: Event | KeyboardEvent, index: number): false {
    e.preventDefault();
    if (!(e.target as HTMLElement).getAttribute('disabled')) {
      this.setPage(index);
    }
    return false;
  }

  setPage(index: number): void {
    this.activePageIndex.set(index);
  }
}
