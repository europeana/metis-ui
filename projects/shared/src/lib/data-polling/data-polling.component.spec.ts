import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { DataPollingComponent, PollingSubjectAccessor } from './data-polling.component';

describe('DataPollingComponent', () => {
  // intervals
  const interval = 5000;
  const halfTick = interval / 2;
  const tickMinusOne = interval - 1;

  // fixture data
  let component: DataPollingComponent;
  let fixture: ComponentFixture<DataPollingComponent>;

  // spies
  let fnProcess: <T>(result: T) => void;
  let fnPoll: <T>() => Observable<T>;
  let fnError: (err: HttpErrorResponse) => HttpErrorResponse | false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [DataPollingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataPollingComponent);
    component = fixture.componentInstance;
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Intantiate poller (needs called from the async context)
  const initDefaultDataPoller = (
    errorMode?: boolean,
    identifier?: string,
    fnDistinctValues: false | ((prev: unknown, curr: unknown) => boolean) = false
  ): PollingSubjectAccessor => {
    fnPoll = (errorMode
      ? <T>(): Observable<T> => {
          return throwError(new Error('mock data-poll error...'));
        }
      : vi.fn(() => of(true)).mockName('fnPoll')) as <T>() => Observable<T>;

    fnProcess = vi.fn().mockName('fnProcess');
    fnError = vi.fn(() => false).mockName('fnError') as (
      err: HttpErrorResponse
    ) => HttpErrorResponse | false;

    return component.createNewDataPoller(
      interval,
      fnPoll,
      fnDistinctValues,
      fnProcess,
      fnError,
      identifier
    );
  };

  const runTicks = (from: number, count: number, interval: number): void => {
    Array.from({ length: count }, (_: number, k: number) => {
      return k + from;
    }).forEach((index) => {
      expect(fnPoll).toHaveBeenCalledTimes(index);
      vi.advanceTimersByTime(interval);
    });
  };

  describe('Normal operations', () => {
    it('should update data periodically', () => {
      initDefaultDataPoller();
      runTicks(1, 4, interval);

      expect(fnPoll).toHaveBeenCalledTimes(5);

      vi.advanceTimersByTime(halfTick);
      expect(fnPoll).toHaveBeenCalledTimes(5);

      vi.advanceTimersByTime(halfTick);
      expect(fnPoll).toHaveBeenCalledTimes(6);

      vi.advanceTimersByTime(tickMinusOne);
      expect(fnPoll).toHaveBeenCalledTimes(6);

      vi.advanceTimersByTime(1);
      expect(fnPoll).toHaveBeenCalledTimes(7);

      component.cleanup();
      vi.advanceTimersByTime(interval);
    });

    it('should update data periodically for multiple data pollers', () => {
      initDefaultDataPoller();

      const fnPoll2 = vi.fn(() => of(true)).mockName('fnPoll_2');
      const fnProcess2 = vi.fn().mockName('fnProcess');
      const fnError2 = vi.fn(() => false).mockName('fnError') as (
        err: HttpErrorResponse
      ) => false | HttpErrorResponse;

      component.createNewDataPoller(interval * 2, fnPoll2, false, fnProcess2, fnError2);

      runTicks(1, 4, interval);
      expect(fnPoll).toHaveBeenCalledTimes(5);
      expect(fnPoll2).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(halfTick);

      expect(fnPoll).toHaveBeenCalledTimes(5);
      expect(fnPoll2).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(halfTick);

      expect(fnPoll).toHaveBeenCalledTimes(6);
      expect(fnPoll2).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(tickMinusOne);

      expect(fnPoll).toHaveBeenCalledTimes(6);
      expect(fnPoll2).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(1);

      expect(fnPoll).toHaveBeenCalledTimes(7);
      expect(fnPoll2).toHaveBeenCalledTimes(4);

      component.cleanup();
      vi.advanceTimersByTime(interval * 2);
    });

    it('should allow polling resets', () => {
      const subject = initDefaultDataPoller().getPollingSubject();
      runTicks(1, 5, interval);
      expect(fnPoll).toHaveBeenCalledTimes(6);
      subject.next(true);
      expect(fnPoll).toHaveBeenCalledTimes(7);
      runTicks(7, 3, interval);
      component.cleanup();
      vi.advanceTimersByTime(interval);
    });

    it('should pause', () => {
      initDefaultDataPoller();
      runTicks(1, 3, interval);
      component.dropPollRate();
      expect(fnPoll).toHaveBeenCalledTimes(4);
      vi.advanceTimersByTime(interval);
      expect(fnPoll).toHaveBeenCalledTimes(4);
      runTicks(4, 3, component.intervalStatusMax);
      component.cleanup();
      vi.advanceTimersByTime(component.intervalStatusMax);
    });

    it('should resubscribe', () => {
      initDefaultDataPoller();
      expect(fnPoll).toHaveBeenCalledTimes(1);
      component.dropPollRate();
      runTicks(1, 2, component.intervalStatusMax);
      component.restorePollRate();
      expect(fnPoll).toHaveBeenCalledTimes(4);
      runTicks(4, 3, interval);
      component.dropPollRate();
      expect(fnPoll).toHaveBeenCalledTimes(7);
      runTicks(7, 5, component.intervalStatusMax);
      component.cleanup();
      vi.advanceTimersByTime(component.intervalStatusMax);
    });

    it('should respond to visibility changes', () => {
      vi.spyOn(component, 'handleVisibilityChange');
      component.visibilitychange();
      expect(component.handleVisibilityChange).toHaveBeenCalled();
      vi.spyOn(component, 'restorePollRate');
      vi.spyOn(component, 'dropPollRate');
      component.handleVisibilityChange(true);
      expect(component.dropPollRate).toHaveBeenCalled();
      expect(component.restorePollRate).not.toHaveBeenCalled();
      component.handleVisibilityChange(false);
      expect(component.restorePollRate).toHaveBeenCalled();
      expect(component.dropPollRate).toHaveBeenCalledTimes(1);
    });

    it('should cleanup on destroy', () => {
      initDefaultDataPoller();
      vi.spyOn(component, 'cleanup');
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
    });

    it('should process distinct values', () => {
      // mock distinct
      initDefaultDataPoller(false, undefined, (_, __) => false);
      expect(fnPoll).toHaveBeenCalledTimes(1);
      expect(fnProcess).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(2);
      expect(fnProcess).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(3);
      expect(fnProcess).toHaveBeenCalledTimes(3);

      // mock indistinct
      initDefaultDataPoller(false, undefined, (_, __) => true);
      expect(fnPoll).toHaveBeenCalledTimes(1);
      expect(fnProcess).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(2);
      expect(fnProcess).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(3);
      expect(fnProcess).toHaveBeenCalledTimes(1);
    });

    it('should cleanup by identifier', async () => {
      const id = 'myId';
      initDefaultDataPoller(false, id);

      expect(fnPoll).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(interval);
      fixture.detectChanges();

      expect(fnPoll).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(4);

      component.clearDataPollerByIdentifier(id);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(4);

      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(4);

      initDefaultDataPoller(false, id);
      expect(fnPoll).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(2);

      component.clearDataPollerByIdentifier(id);
      vi.advanceTimersByTime(interval);

      expect(fnPoll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    it('should invoke the error handling function on error', () => {
      initDefaultDataPoller(true);
      expect(fnError).toHaveBeenCalled();
      expect(fnProcess).not.toHaveBeenCalled();
    });
  });
});
