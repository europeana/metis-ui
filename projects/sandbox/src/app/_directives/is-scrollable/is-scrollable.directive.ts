import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  signal
} from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true
})
export class IsScrollableDirective implements AfterViewInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);

  actualScroll = signal(0);
  canScrollBack = signal(false);
  canScrollFwd = signal(false);
  nativeElement = signal(this.elementRef.nativeElement);

  private observer?: MutationObserver;

  constructor() {
    const element = this.elementRef.nativeElement;

    // 🚀 FIXED FOR ZONELESS: Defer calculation to a microtask so it hits
    // the next Angular check sweep cleanly when child nodes are appended
    this.observer = new MutationObserver((_: MutationRecord[]) => {
      queueMicrotask(() => {
        this.calc();
      });
    });

    this.observer.observe(element, {
      childList: true,
      subtree: true
    });
  }

  ngAfterViewInit(): void {
    // 🚀 FIXED FOR ZONELESS: Avoid direct synchronous detectChanges loop crashes
    queueMicrotask(() => {
      this.calc();
    });
  }

  /** calc
  /* updates the variables
  /* - canScrollBack
  /* - canScrollFwd
  /* according to the element's relative height and scroll position
  */
  @HostListener('window:resize', ['$event'])
  @HostListener('scroll', ['$event'])
  calc(e?: Event): void {
    const el = this.elementRef.nativeElement;
    const scrollSpace = el.scrollHeight;
    const dimension = el.getBoundingClientRect().height;
    const actualScroll = el.scrollTop;

    const nextScrollBack = actualScroll > 0;
    const nextScrollFwd = scrollSpace > actualScroll + dimension + 1;

    // Only update signals and notify view layer if values actually changed
    if (this.canScrollBack() !== nextScrollBack) this.canScrollBack.set(nextScrollBack);
    if (this.canScrollFwd() !== nextScrollFwd) this.canScrollFwd.set(nextScrollFwd);
    if (this.actualScroll() !== actualScroll) this.actualScroll.set(actualScroll);

    // 🚀 CRITICAL FOR ZONELESS: Manually request a redraw since we are handling
    // asynchronous browser native scroll/resize/mutation observations.
    this.changeDetector.markForCheck();

    if (e) {
      e.stopPropagation();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
