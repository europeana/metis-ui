import { NgClass, NgIf } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  signal,
  ViewChild
} from '@angular/core';
import { debounceTime, tap } from 'rxjs/operators';
import { SubscriptionManager } from 'shared';

@Component({
  selector: 'sb-skip-arrows',
  templateUrl: './skip-arrows.component.html',
  styleUrls: ['./skip-arrows.component.scss'],
  imports: [NgClass, NgIf]
})
export class SkipArrowsComponent extends SubscriptionManager implements AfterViewInit {
  @ContentChildren('elementList', { read: ElementRef }) elementList: QueryList<ElementRef>;
  @ViewChild('container') container: ElementRef;

  canScrollUp = signal(false);
  canScrollDown = signal(false);
  debounceDelay = 100;

  scrollSubject = new BehaviorSubject(true);
  viewerVisibleIndex = 0;
  ready = false;

  /** ngAfterViewInit
   * bind (debounced) scrollSubject to the updateViewerVisibleIndex function
   * flag as ready
   **/
  ngAfterViewInit(): void {
    this.container.nativeElement.scrollTop = 0;
    this.subs.push(
      this.scrollSubject
        .pipe(
          debounceTime(this.debounceDelay),
          tap(() => {
            this.updateViewerVisibleIndex();
            this.updateScrollPossibilities();
          })
        )
        .subscribe()
    );
    this.ready = true;

    new IntersectionObserver(this.intersectionObserverCallback.bind(this), {
      threshold: [0, 0, 0, 0]
    }).observe(this.container.nativeElement);
  }

  /** initialiseIntersectionObserver
   * binds the headerRef's pageTitleInViewport to an intersection observer
   * generates a threshold config option of [0, 0.1, ..., 0.9]
   **/
  intersectionObserverCallback(): void {
    this.scrollSubject.next(true);
  }

  /** getScrollableParent
   *
   * @returns HTMLElement or null
   **/
  getScrollableParent(detectionIndex = 0): HTMLElement | null {
    if (!this.ready) {
      return null;
    }
    if (this.elementList) {
      const element = this.elementList.get(detectionIndex);
      if (element && element.nativeElement) {
        return element.nativeElement.parentNode;
      }
    }
    return null;
  }

  updateScrollPossibilities(): void {
    const scrollEl = this.getScrollableParent();
    if (scrollEl && scrollEl.scrollTop > 0) {
      this.canScrollUp.set(scrollEl.scrollTop > 0);
    } else {
      this.canScrollUp.set(false);
    }

    if (this.elementList && this.elementList.length <= this.viewerVisibleIndex + 1) {
      this.canScrollDown.set(false);
    }
    if (scrollEl && scrollEl.scrollHeight > 0) {
      this.canScrollDown.set(scrollEl.scrollTop + scrollEl.offsetHeight < scrollEl.scrollHeight);
    } else {
      this.canScrollDown.set(false);
    }
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
      const indexedEl = this.elementList.get(index);
      if (indexedEl) {
        parent.scrollTop = indexedEl.nativeElement.offsetTop;
        this.scrollSubject.next(true);
      }
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
