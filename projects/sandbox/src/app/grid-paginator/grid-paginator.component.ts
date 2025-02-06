import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PagerInfo, TierSummaryRecord } from '../_models';

@Component({
  selector: 'sb-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss'],
  imports: [NgIf]
})
export class GridPaginatorComponent {
  _rows: Array<TierSummaryRecord>;

  get rows(): Array<TierSummaryRecord> {
    return this._rows;
  }
  @Input() set rows(rows: Array<TierSummaryRecord>) {
    this._rows = rows;
    this.pages = this.calculatePages(this._rows);
    this.setPage(0);
  }
  get maxPageSize(): number {
    return this._maxPageSize;
  }
  @Input() set maxPageSize(maxPageSize: number) {
    this._maxPageSize = maxPageSize;
    if (this.pages) {
      const allPages = this.pages[0].concat(...this.pages.splice(1));
      this.pages = this.calculatePages(allPages);
      this.setPage(0);
    }
  }
  @Output() change: EventEmitter<PagerInfo> = new EventEmitter();

  activePageIndex = 0;
  pages: Array<Array<TierSummaryRecord>>;
  ranges: Array<Array<number>>;
  _maxPageSize = 10;
  totalPageCount: number;
  totalRows: number;

  /**
   * calculatePages
   * generates page structure (stored as this.ranges) and returns row data
   * @param {Array<TierSummaryRecord>} rows - the rows to paginate
   * @returns Array<Array<TierSummaryRecord>>
   **/
  calculatePages(rows: Array<TierSummaryRecord>): Array<Array<TierSummaryRecord>> {
    // create loose range structure, i.e. [[0,10],[10,20],[20,30]]
    const ranges = Array.from(
      {
        length: Math.ceil(rows.length / this.maxPageSize)
      },
      (_, i: number) => {
        const lowerIndex = i * this.maxPageSize;
        const upperIndex = lowerIndex + this.maxPageSize;
        return [lowerIndex, upperIndex];
      }
    );

    const pages = ranges.map((range: Array<number>) => {
      return rows.slice(range[0], range[1]);
    });

    // store precise range structure, i.e. [[1,10],[11,20],[21,25]]
    this.ranges = ranges.map((range: Array<number>) => {
      return [range[0] + 1, Math.min(range[1], rows.length)];
    });

    this.totalRows = rows.length;
    this.totalPageCount = pages.length;
    return pages;
  }

  canNext(): boolean {
    return this.activePageIndex + 1 < this.totalPageCount;
  }

  canPrev(): boolean {
    return this.activePageIndex > 0;
  }

  callSetPage(e: Event | KeyboardEvent, index: number): false {
    e.preventDefault();
    if (!(e.target as HTMLElement).getAttribute('disabled')) {
      this.setPage(index);
    }
    return false;
  }

  setPage(index: number): void {
    this.activePageIndex = index;
    this.change.emit({
      currentPage: index,
      pageCount: this.pages.length,
      pageRows: this.pages[index]
    });
  }
}
