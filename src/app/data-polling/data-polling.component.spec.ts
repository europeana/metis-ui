import { HttpErrorResponse } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { DataPollingComponent } from './';

describe('DataPollingComponent', () => {
  const interval = 5000;
  const fnEmpty = (err: HttpErrorResponse): HttpErrorResponse => {
    return err;
  };
  let component: DataPollingComponent;
  let fixture: ComponentFixture<DataPollingComponent>;

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

  const createDataPoller = <T>(pollFn: () => Observable<T>): Subject<boolean> => {
    const processFn = jasmine.createSpy('process');
    const subject: Subject<boolean> = component.createNewDataPoller(
      interval,
      pollFn,
      processFn,
      fnEmpty
    );
    return subject;
  };

  describe('Normal operations', () => {
    it('should update data periodically', fakeAsync(() => {
      const pollFn = jasmine.createSpy().and.callFake(() => of(true));
      createDataPoller(pollFn);

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(pollFn).toHaveBeenCalledTimes(index);
        tick(interval);
      });

      component.cleanup();
      tick(interval);
    }));

    it('should allow polling resets', fakeAsync(() => {
      const pollFn = jasmine.createSpy().and.callFake(() => of(true));
      const subject: Subject<boolean> = createDataPoller(pollFn);

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(pollFn).toHaveBeenCalledTimes(index);
        tick(interval);
      });

      console.log('\nTESTED GROUP OF 5\n');

      expect(pollFn).toHaveBeenCalledTimes(6);

      console.log('\nTEST HITS NEXT....\n');

      subject.next(true);
      expect(pollFn).toHaveBeenCalledTimes(7);

      console.log('\n...TEST NEXT CONFIRMED\n');

      [8, 9, 10].forEach((index) => {
        tick(interval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.cleanup();
      tick(interval);
    }));

    it('should pause', fakeAsync(() => {
      const pollFn = jasmine.createSpy('poll').and.callFake(() => of(true));

      createDataPoller(pollFn);

      [2, 3, 4].forEach((index) => {
        tick(interval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.dropPollRate();
      expect(pollFn).toHaveBeenCalledTimes(4);
      tick(interval);
      expect(pollFn).toHaveBeenCalledTimes(4);

      [5, 6, 7].forEach((index) => {
        tick(component.slowPollInterval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.cleanup();
      tick(component.slowPollInterval);
    }));

    it('should resubscribe', fakeAsync(() => {
      const pollFn = jasmine.createSpy('poll').and.callFake(() => of(true));

      createDataPoller(pollFn);

      expect(pollFn).toHaveBeenCalledTimes(1);
      component.dropPollRate();

      [2, 3].forEach((index) => {
        tick(component.slowPollInterval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.restorePollRate();

      expect(pollFn).toHaveBeenCalledTimes(4);

      [5, 6, 7].forEach((index) => {
        tick(interval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.dropPollRate();
      expect(pollFn).toHaveBeenCalledTimes(7);

      [8, 9, 10, 11, 12].forEach((index) => {
        tick(component.slowPollInterval);
        expect(pollFn).toHaveBeenCalledTimes(index);
      });

      component.cleanup();
      tick(component.slowPollInterval);
    }));

    it('should cleanup on destroy', fakeAsync(() => {
      spyOn(component, 'cleanup').and.callThrough();
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
    }));
  });

  describe('Error handling', () => {
    it('should invoke the error handling function on error', fakeAsync(() => {
      const pollFn = <T>(): Observable<T> => {
        return throwError('mock data-poll error...');
      };
      const processFn = jasmine.createSpy('process');
      const errrorFn = jasmine.createSpy('error-handler');
      component.createNewDataPoller(interval, pollFn, processFn, errrorFn);
      expect(errrorFn).toHaveBeenCalled();
      expect(processFn).not.toHaveBeenCalled();
    }));
  });
});
