import {
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClickService } from '../_services/click.service';

@Directive({
  selector: '[libClickAware]',
  exportAs: 'clickInfo',
  standalone: true
})
export class ClickAwareDirective {
  readonly ignoreClasses = input<Array<string>>([]);
  readonly clickAwareIgnoreWhen = input<boolean | undefined>();
  @Output() readonly clickOutside = new EventEmitter<void>();

  isClickedInside = false;

  private readonly clickService = inject(ClickService);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.clickService.documentClickedTarget
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((target: HTMLElement) => {
        this.documentClickListener(this.elementRef.nativeElement, target);
      });
  }

  documentClickListener(nativeElement: HTMLElement, clickTarget: HTMLElement): void {
    if (this.clickAwareIgnoreWhen()) return;

    if (this.shouldIgnoreClick(clickTarget)) return;

    this.isClickedInside = nativeElement.contains(clickTarget);
    if (!this.isClickedInside) {
      this.clickOutside.emit();
    }
  }

  private shouldIgnoreClick(clickTarget: HTMLElement): boolean {
    const classesToIgnore = this.ignoreClasses();
    if (classesToIgnore.length === 0) return false;

    let node: HTMLElement | null = clickTarget;
    while (node) {
      if (node.classList) {
        for (const clss of classesToIgnore) {
          if (node.classList.contains(clss)) {
            return true;
          }
        }
      }
      node = node.parentNode as HTMLElement | null;
    }
    return false;
  }
}
