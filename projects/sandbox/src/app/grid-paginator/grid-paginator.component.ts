import { NgIf } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { PagerInfo, TierSummaryRecord } from '../_models';

@Component({
  selector: 'sb-grid-paginator',
  templateUrl: './grid-paginator.component.html',
  styleUrls: ['./grid-paginator.component.scss'],
  imports: [NgIf]
})
export class GridPaginatorComponent {
  rows = input.required<Array<TierSummaryRecord>>();
  /*
  _rows: Array<TierSummaryRecord>;

  get rows(): Array<TierSummaryRecord> {
    return this._rows;
  }
  @Input() set rows(rows: Array<TierSummaryRecord>) {
    this._rows = rows;
    this.pages = this.calculatePages(this._rows);
    this.setPage(0);
  }
  */

  maxPageSize = input<number>(10);

  /*
  get maxPageSize(): number {
    return this._maxPageSize;
  }
  @Input() set maxPageSize(maxPageSize: number) {
    this._maxPageSize = maxPageSize;
    //if (this.pages) {
      const allPages = tfhis.pages[0].concat(...this.pages.splice(1));
      this.pages = this.calculatePages(allPages);
      this.setPage(0);
    //}
  }
  */
  change = output<PagerInfo>();

  //activePageIndex = 0;
  //activePageIndex = signal(0);

  //pages: Array<Array<TierSummaryRecord>>;

  /*
  pages = computed(()=> {
    //this.activePageIndex = 0;
    //this.setPage(0);
    const pages = this.calculatePages(this.rows());
    return pages;
  });
  */

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
    /*

    const pages = ranges.map((range: Array<number>) => {
      return rows.slice(range[0], range[1]);
    });

    this.ranges = ranges.map((range: Array<number>) => {
      return [range[0] + 1, Math.min(range[1], rows.length)];
    });
    */

    //this.totalRows = rows.length;
    //this.totalPageCount = pages.length;
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
    source: () => this.totalPageCount,
    computation: () => {
      return 0;
    }
  });

  //ranges: Array<Array<number>>;
  //ranges = signal<Array<Array<number>>>([]);

  //_maxPageSize = 10;
  //totalPageCount: number;
  //totalRows: number;
  totalRows = computed(() => this.rows().length);

  /**
   * calculatePages
   * generates page structure (stored as this.ranges) and returns row data
   * @param {Array<TierSummaryRecord>} rows - the rows to paginate
   * @returns Array<Array<TierSummaryRecord>>
   **/
  /*
  calculatePages(rows: Array<TierSummaryRecord>): Array<Array<TierSummaryRecord>> {
    // create loose range structure, i.e. [[0,10],[10,20],[20,30]]
    const ranges = Array.from(
      {
        length: Math.ceil(rows.length / this.maxPageSize())
      },
      (_, i: number) => {
        const lowerIndex = i * this.maxPageSize();
        const upperIndex = lowerIndex + this.maxPageSize();
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

    //this.totalRows = rows.length;
    //this.totalPageCount = pages.length;
    return pages;
  }
  */

  canNext(): boolean {
    console.log('next?  this.totalPageCount() = ' + this.totalPageCount());
    return this.activePageIndex() + 1 < this.totalPageCount();
  }

  canPrev(): boolean {
    return this.activePageIndex() > 0;
  }

  callSetPage(e: Event | KeyboardEvent, index: number): false {
    e.preventDefault();
    console.log('in the setpage...');
    if (!(e.target as HTMLElement).getAttribute('disabled')) {
      console.log(' - in the setpage...' + index);

      this.setPage(index);
    }
    console.log(' - in the setpage...F');
    return false;
  }

  setPage(index: number): void {
    //if(this.activePageIndex() === index){
    //  return;
    //}
    //this.activePageIndex.set(index);
    this.change.emit({
      currentPage: this.activePageIndex(),
      pageCount: this.totalPageCount(),
      //pageRows: this.pages()[index]
      pageRows: this.pagesAndRanges().pages[index]
    });
  }
}
