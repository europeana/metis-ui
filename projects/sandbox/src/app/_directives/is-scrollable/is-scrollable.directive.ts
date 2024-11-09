import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true
})
export class IsScrollableDirective implements AfterViewInit {
  canScrollBack = false;
  canScrollFwd = false;

  constructor(private readonly elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;
    new MutationObserver((_: MutationRecord[]) => {
      this.calc();
    }).observe(element, {
      childList: true
    });
  }

  ngAfterViewInit(): void {
    const fn = (): void => {
      this.calc();
    };
    setTimeout(fn, 0);
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
    const actualScroll = el.scrollTop;

    this.canScrollBack = actualScroll > 0;
    this.canScrollFwd = scrollSpace > actualScroll + dimension + 1;
    if (e) {
      e.stopPropagation();
    }
  }
}
