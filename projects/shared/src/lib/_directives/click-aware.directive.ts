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

    let shouldIgnore = false;
    const classesToIgnore = this.ignoreClasses();

    if (classesToIgnore.length > 0) {
      let node: HTMLElement | null = clickTarget;
      while (node) {
        if (node.classList) {
          for (const clss of classesToIgnore) {
            if (node.classList.contains(clss)) {
              shouldIgnore = true;
              break;
            }
          }
        }
        if (shouldIgnore) break;
        node = node.parentNode as HTMLElement | null;
      }
    }

    if (!shouldIgnore) {
      this.isClickedInside = nativeElement.contains(clickTarget);
      if (!this.isClickedInside) {
        this.clickOutside.emit();
      }
    }
  }
}
