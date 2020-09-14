import { HttpErrorResponse } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { DataPollingComponent, PollingSubjectAccesor } from './';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [DataPollingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPollingComponent);
    component = fixture.componentInstance;
  });

  // Intantiate poller (needs called from the async context)
  const initDefaultDataPoller = (errorMode?: boolean): PollingSubjectAccesor => {
    fnPoll = errorMode
      ? <T>(): Observable<T> => {
          return throwError(new Error('mock data-poll error...'));
        }
      : jasmine.createSpy('fnPoll').and.callFake(() => of(true));
    fnProcess = jasmine.createSpy('fnProcess');
    fnError = jasmine.createSpy('fnError').and.callFake(() => false);
    return component.createNewDataPoller(interval, fnPoll, fnProcess, fnError);
  };

  const runTicks = (from: number, count: number, interval: number): void => {
    Array.from({ length: count }, (_: number, k: number) => {
      return k + from;
    }).forEach((index) => {
      expect(fnPoll).toHaveBeenCalledTimes(index);
      tick(interval);
    });
  };

  describe('Normal operations', () => {
    it('should update data periodically', fakeAsync(() => {
      initDefaultDataPoller();
      runTicks(1, 4, interval);

      expect(fnPoll).toHaveBeenCalledTimes(5);
      tick(halfTick);
      expect(fnPoll).toHaveBeenCalledTimes(5);
      tick(halfTick);

      expect(fnPoll).toHaveBeenCalledTimes(6);
      tick(tickMinusOne);
      expect(fnPoll).toHaveBeenCalledTimes(6);
      tick(1);
      expect(fnPoll).toHaveBeenCalledTimes(7);

      component.cleanup();
      tick(interval);
    }));

    it('should update data periodically for multiple data pollers', fakeAsync(() => {
      initDefaultDataPoller();

      const fnPoll2 = jasmine.createSpy('fnPoll_2').and.callFake(() => of(true));
      const fnProcess2 = jasmine.createSpy('fnProcess');
      const fnError2 = jasmine.createSpy('fnError').and.callFake(() => false);

      component.createNewDataPoller(interval * 2, fnPoll2, fnProcess2, fnError2);

      runTicks(1, 4, interval);
      expect(fnPoll).toHaveBeenCalledTimes(5);
      expect(fnPoll2).toHaveBeenCalledTimes(3);

      tick(halfTick);
      expect(fnPoll).toHaveBeenCalledTimes(5);
      expect(fnPoll2).toHaveBeenCalledTimes(3);
      tick(halfTick);
      expect(fnPoll).toHaveBeenCalledTimes(6);
      expect(fnPoll2).toHaveBeenCalledTimes(3);
      tick(tickMinusOne);
      expect(fnPoll).toHaveBeenCalledTimes(6);
      expect(fnPoll2).toHaveBeenCalledTimes(3);
      tick(1);
      expect(fnPoll).toHaveBeenCalledTimes(7);
      expect(fnPoll2).toHaveBeenCalledTimes(4);

      component.cleanup();
      tick(interval * 2);
    }));

    it('should allow polling resets', fakeAsync(() => {
      const subject = initDefaultDataPoller().getPollingSubject();
      runTicks(1, 5, interval);
      expect(fnPoll).toHaveBeenCalledTimes(6);
      subject.next(true);
      expect(fnPoll).toHaveBeenCalledTimes(7);
      runTicks(7, 3, interval);
      component.cleanup();
      tick(interval);
    }));

    it('should pause', fakeAsync(() => {
      initDefaultDataPoller();
      runTicks(1, 3, interval);
      component.dropPollRate();
      expect(fnPoll).toHaveBeenCalledTimes(4);
      tick(interval);
      expect(fnPoll).toHaveBeenCalledTimes(4);
      runTicks(4, 3, environment.intervalStatusMax);
      component.cleanup();
      tick(environment.intervalStatusMax);
    }));

    it('should resubscribe', fakeAsync(() => {
      initDefaultDataPoller();
      expect(fnPoll).toHaveBeenCalledTimes(1);
      component.dropPollRate();
      runTicks(1, 2, environment.intervalStatusMax);
      component.restorePollRate();
      expect(fnPoll).toHaveBeenCalledTimes(4);
      runTicks(4, 3, interval);
      component.dropPollRate();
      expect(fnPoll).toHaveBeenCalledTimes(7);
      runTicks(7, 5, environment.intervalStatusMax);
      component.cleanup();
      tick(environment.intervalStatusMax);
    }));

    it('should respond to visibility changes', fakeAsync(() => {
      spyOn(component, 'handleVisibilityChange').and.callThrough();
      component.visibilitychange();
      expect(component.handleVisibilityChange).toHaveBeenCalled();
      spyOn(component, 'restorePollRate').and.callThrough();
      spyOn(component, 'dropPollRate').and.callThrough();
      component.handleVisibilityChange(true);
      expect(component.dropPollRate).toHaveBeenCalled();
      expect(component.restorePollRate).not.toHaveBeenCalled();
      component.handleVisibilityChange(false);
      expect(component.restorePollRate).toHaveBeenCalled();
      expect(component.dropPollRate).toHaveBeenCalledTimes(1);
    }));

    it('should cleanup on destroy', fakeAsync(() => {
      initDefaultDataPoller();
      spyOn(component, 'cleanup').and.callThrough();
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
      tick(interval);
    }));
  });

  describe('Error handling', () => {
    it('should invoke the error handling function on error', fakeAsync(() => {
      initDefaultDataPoller(true);
      expect(fnError).toHaveBeenCalled();
      expect(fnProcess).not.toHaveBeenCalled();
    }));
  });
});
