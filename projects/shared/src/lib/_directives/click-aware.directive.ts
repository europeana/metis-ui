import { Directive, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { SubscriptionManager } from '../subscription-manager/subscription.manager';
import { ClickService } from '../_services/click.service';

@Directive({
  selector: '[libClickAware]',
  exportAs: 'clickInfo',
  standalone: true
})
export class ClickAwareDirective extends SubscriptionManager {
  @Input() ignoreClasses: Array<string> = [];
  @Input() clickAwareIgnoreWhen?: boolean;
  @Output() clickOutside: EventEmitter<void> = new EventEmitter();

  isClickedInside = false;

  private readonly clickService: ClickService;
  private readonly elementRef: ElementRef;

  /**
   *  constructor
   *  subscribe to the global document click host listener via the clickService
   */
  constructor() {
    super();
    this.clickService = inject(ClickService);
    this.elementRef = inject(ElementRef);

    this.subs.push(
      this.clickService.documentClickedTarget.subscribe((target: HTMLElement) => {
        this.documentClickListener(this.elementRef.nativeElement, target);
      })
    );
  }

  /**
   *  documentClickListener
   *   update isClickedInside
   *   emit event if outside
   */
  documentClickListener(nativeElement: HTMLElement, clickTarget: HTMLElement): void {
    if (this.clickAwareIgnoreWhen) {
      return;
    }

    let shouldIgnore = false;

    if (this.ignoreClasses.length > 0) {
      let node = clickTarget;
      while (node) {
        this.ignoreClasses.forEach((clss: string) => {
          if (node.classList?.contains(clss)) {
            shouldIgnore = true;
          }
        });
        node = (node.parentNode as unknown) as HTMLElement;
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
