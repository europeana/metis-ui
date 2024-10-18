import { ChangeDetectorRef } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  OnInit,
  QueryList
} from '@angular/core';
import { debounceTime, tap } from 'rxjs/operators';
import { SubscriptionManager } from 'shared';

@Component({
  selector: 'sb-skip-arrows',
  templateUrl: './skip-arrows.component.html',
  styleUrls: ['./skip-arrows.component.scss'],
  imports: [NgClass, NgIf],
  standalone: true
})
export class SkipArrowsComponent extends SubscriptionManager implements AfterContentInit, OnInit {
  @ContentChildren('elementList', { read: ElementRef }) elementList: QueryList<ElementRef>;

  scrollSubject = new BehaviorSubject(true);
  viewerVisibleIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterContentInit() {
    this.elementList.changes.subscribe(() => {
      this.cdr.detectChanges();
      this.updateViewerVisibleIndex();
    });
  }

  /** ngOnInit
   * bind (debounced) scrollSubject to the updateViewerVisibleIndex function
   **/
  ngOnInit(): void {
    this.subs.push(
      this.scrollSubject
        .pipe(
          debounceTime(100),
          tap(() => {
            this.updateViewerVisibleIndex();
          })
        )
        .subscribe()
    );
  }

  /** getScrollableParent
   *
   * @returns HTMLElement or null
   **/
  getScrollableParent(detectionIndex = 0): HTMLElement | null {
    if (this.elementList) {
      const element = this.elementList.get(detectionIndex);
      if (element?.nativeElement) {
        return element?.nativeElement.parentNode;
      }
    }
    return null;
  }

  canScrollUp(): boolean {
    const scrollEl = this.getScrollableParent();
    if (scrollEl && scrollEl.scrollTop > 0) {
      return scrollEl.scrollTop > 0;
    }
    return false;
  }

  canScrollDown(): boolean {
    const scrollEl = this.getScrollableParent();
    if (scrollEl && scrollEl.scrollHeight > 0) {
      return scrollEl.scrollTop + scrollEl.offsetHeight < scrollEl.scrollHeight;
    }
    return false;
  }

  /** skipToItem
   * @param { number } index - the item index
   * updates scrollTop on the parent of the indexed ViewChild
   **/
  skipToItem(index: number): void {
    if (!this.elementList) {
      return;
    }
    if (index < 0) {
      index = 0;
    }

    const parent = this.getScrollableParent(index);
    if (parent) {
      console.log('skipping to ' + index);
      parent.scrollTop = this.elementList.get(index)?.nativeElement.offsetTop - 8;
      this.updateViewerVisibleIndex();
    }
  }

  /** updateViewerVisibleIndex
   * updates the viewerVisibleIndex according to the scrollHeight
   **/
  updateViewerVisibleIndex(): void {
    this.elementList.forEach((item, index) => {
      const distance = item.nativeElement.parentNode.scrollTop + 32;
      if (distance >= item.nativeElement.offsetTop) {
        this.viewerVisibleIndex = index;
      }
    });
  }

  onScroll(): void {
    this.scrollSubject.next(true);
  }
}
