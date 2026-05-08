import {
  afterNextRender,
  Directive,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal
} from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true
})
export class IsScrollableDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef);

  actualScroll = signal(0);
  canScrollBack = signal(false);
  canScrollFwd = signal(false);
  nativeElement = signal(this.elementRef.nativeElement);

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor() {
    const el = this.elementRef.nativeElement;

    // 1. Setup Observers with requestAnimationFrame to prevent loops
    this.mutationObserver = new MutationObserver(() => this.scheduleCalc());
    this.mutationObserver.observe(el, { childList: true, subtree: true });

    this.resizeObserver = new ResizeObserver(() => this.scheduleCalc());
    this.resizeObserver.observe(el);

    // 2. Initial check after first render
    afterNextRender(() => {
      this.calc();
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll(e: Event): void {
    this.calc();
    if (e) e.stopPropagation();
  }

  private scheduleCalc(): void {
    // This moves the calc to the next browser frame,
    // stopping the ResizeObserver loop lock-up.
    requestAnimationFrame(() => this.calc());
  }

  calc(): void {
    const el = this.elementRef.nativeElement;
    const scrollSpace = el.scrollHeight;
    const dimension = el.clientHeight;
    const actualScroll = el.scrollTop;

    // We only update if values actually change to save performance
    const back = actualScroll > 0;
    const fwd = scrollSpace > actualScroll + dimension + 1;

    if (this.canScrollBack() !== back) this.canScrollBack.set(back);
    if (this.canScrollFwd() !== fwd) this.canScrollFwd.set(fwd);
    if (this.actualScroll() !== actualScroll) this.actualScroll.set(actualScroll);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
