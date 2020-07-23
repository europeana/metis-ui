import { Subject, timer } from 'rxjs';
import { delayWhen, filter, tap } from 'rxjs/operators';

export interface TriggerDelayConfig {
  subject: Subject<boolean>;
  wait: number;
  blockIf?: () => boolean;
}

export const triggerDelay = new Subject<TriggerDelayConfig>();

triggerDelay
  .pipe(
    delayWhen((val) => {
      return timer(val.wait);
    }),
    filter((val) => {
      return val.blockIf ? !val.blockIf() : true;
    }),
    tap((val) => val.subject.next(true))
  )
  .subscribe();
