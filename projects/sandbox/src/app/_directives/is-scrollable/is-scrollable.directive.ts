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
  private readonly changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);

  actualScroll = signal(0);
  canScrollBack = signal(false);
  canScrollFwd = signal(false);

  constructor(private readonly elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;
    new MutationObserver((_: MutationRecord[]) => {
      this.calc();
    }).observe(element, {
      childList: true,
      subtree: true
    });
  }

  ngAfterViewInit(): void {
    this.calc();
    this.changeDetector.detectChanges();
  }

  /** calc
  /* updates the variables
  /* - canScrollBack
  /* - canScrollFwd
  /* according to the element's relative width and scroll position
  */
  @HostListener('window:resize', ['$event'])
  @HostListener('scroll', ['$event'])
  calc(e?: Event): void {
    const el = this.elementRef.nativeElement;
    const scrollSpace = el.scrollHeight;
    const dimension = el.getBoundingClientRect().height;

    this.canScrollBack.set(actualScroll > 0);
    this.canScrollFwd.set(scrollSpace > actualScroll + dimension + 1);
    this.actualScroll.set(el.scrollTop);
    if (e) {
      e.stopPropagation();
    }
  }
}
