import { HttpErrorResponse } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { DataPollingComponent } from './';

describe('DataPollingComponent', () => {
  const interval = 5000;
  const fnEmpty = (err: HttpErrorResponse) => {
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

  describe('Normal operations', () => {
    it('should update data periodically and allow polling resets', fakeAsync(() => {
      const pollFn = jasmine.createSpy().and.callFake(() => of(true));
      const processFn = jasmine.createSpy('process');
      const subject: Subject<boolean> = component.createNewDataPoller(
        interval,
        pollFn,
        processFn,
        fnEmpty
      );

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(pollFn).toHaveBeenCalledTimes(index);
        tick(interval);
      });
      expect(pollFn).toHaveBeenCalledTimes(6);
      subject.next(true);
      expect(pollFn).toHaveBeenCalledTimes(7);
      component.cleanup();
      tick(interval);
    }));

    it('should cleanup on destroy', fakeAsync(() => {
      spyOn(component, 'cleanup').and.callThrough();
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
    }));
  });

  describe('Error handling', () => {
    it('should invoke the error handling function on error', fakeAsync(() => {
      const pollFn = () => {
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
