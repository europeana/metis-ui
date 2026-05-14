import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  computed
} from '@angular/core';

@Directive({
  selector: '[appIsScrollable]',
  exportAs: 'scrollInfo',
  standalone: true
})
export class IsScrollableDirective implements AfterViewInit, OnDestroy {
  // FIX: Changed from private to public so internal workspace directives can access it directly
  public readonly elementRef = inject(ElementRef);

  canScrollBack = signal<boolean>(false);
  canScrollFwd = signal<boolean>(false);

  // FIX: Provided missing state signal tracked by DropInComponent layouts
  actualScroll = signal<number>(0);

  // FIX: Expose a computed signal abstraction wrapper matching DropIn's component queries
  nativeElement = computed(() => this.elementRef.nativeElement);

  private resizeObserver?: ResizeObserver;
  private scrollListenerRef?: () => void;
  private calcTimeoutId: any;

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement;
    const parent = el.parentNode as HTMLElement;

    this.resizeObserver = new ResizeObserver(() => {
      this.debouncedCalc();
    });
    this.resizeObserver.observe(el);

    if (parent) {
      this.scrollListenerRef = () => {
        // Defer scroll tracking updates to eliminate pixel-by-pixel change triggers
        requestAnimationFrame(() => {
          this.actualScroll.set(parent.scrollTop || parent.scrollLeft || 0);
        });
        this.debouncedCalc();
      };
      parent.addEventListener('scroll', this.scrollListenerRef, { passive: true });
      this.resizeObserver.observe(parent);
    }
    this.calc();
  }

  private debouncedCalc(): void {
    if (this.calcTimeoutId) {
      clearTimeout(this.calcTimeoutId);
    }
    this.calcTimeoutId = setTimeout(() => {
      this.calc();
    }, 16);
  }

  calc(): void {
    const el = this.elementRef.nativeElement;
    const parent = el.parentNode as HTMLElement;
    if (!parent) return;

    if (parent.clientWidth === 0 || parent.clientHeight === 0 || el.clientWidth === 0) {
      return;
    }

    const sw = el.scrollWidth;
    const w = parent.clientWidth;
    const sl = parent.scrollLeft;

    const nextScrollBack = sl > 0;
    const nextScrollFwd = sw > sl + w + 1;

    // ✅ THE LINE FIX: Defers writing to signals until the next frame to break the infinite change detection layout loop
    requestAnimationFrame(() => {
      if (this.canScrollBack() !== nextScrollBack) {
        this.canScrollBack.set(nextScrollBack);
      }
      if (this.canScrollFwd() !== nextScrollFwd) {
        this.canScrollFwd.set(nextScrollFwd);
      }
    });
  }

  nav(direction: number): void {
    const parent = this.elementRef.nativeElement.parentNode as HTMLElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const diff = direction * width;
    const newX = parent.scrollLeft + diff;

    parent.scrollTo({
      left: newX,
      top: 0,
      behavior: 'smooth'
    });

    this.debouncedCalc();
  }

  fwd(): void {
    this.nav(1);
  }

  back(): void {
    this.nav(-1);
  }

  ngOnDestroy(): void {
    if (this.calcTimeoutId) {
      clearTimeout(this.calcTimeoutId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    const parent = this.elementRef.nativeElement.parentNode as HTMLElement;
    if (parent && this.scrollListenerRef) {
      parent.removeEventListener('scroll', this.scrollListenerRef);
    }
  }
}
