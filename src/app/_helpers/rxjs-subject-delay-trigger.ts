import { Subject, timer } from 'rxjs';
import { delayWhen, filter, tap } from 'rxjs/operators';

export const triggerDelay = new Subject<{
  subject: Subject<boolean>;
  wait: number;
  blockIf?: () => boolean;
  blockThen?: () => void;
}>();

triggerDelay
  .pipe(
    delayWhen((val) => {
      return timer(val.wait);
    }),
    filter((val) => {
      const res = val.blockIf ? !val.blockIf() : true;
      if (!res && val.blockThen) {
        val.blockThen();
      }
      return res;
    }),
    tap((val) => val.subject.next(true))
  )
  .subscribe();
