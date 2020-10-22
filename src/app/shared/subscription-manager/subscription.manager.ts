/** SubscriptionManager
/*  stores references to subscriptions / unsubscribes from them on destroy
*/
import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export class SubscriptionManager implements OnDestroy {
  subs: Array<Subscription> = [];

  /** ngOnDestroy
  /* invoke cleanup
  */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** cleanup
  /* unsubscribe from subscriptions
  */
  cleanup(): void {
    this.subs.forEach((sub: Subscription | undefined) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    this.subs = [];
  }
}
