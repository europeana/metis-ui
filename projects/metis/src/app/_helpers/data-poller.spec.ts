import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { createPoller } from './';

describe('createPoller Utility', () => {
  const interval = 5000;
  let serviceCallSpy: jasmine.Spy;
  let dataProcessSpy: jasmine.Spy;
  let errorSpy: jasmine.Spy;

  beforeEach(() => {
    jasmine.clock().install();

    serviceCallSpy = jasmine.createSpy('fnServiceCall').and.returnValue(of('mock data'));
    dataProcessSpy = jasmine.createSpy('fnDataProcess');
    errorSpy = jasmine.createSpy('fnOnError');

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should immediately trigger the service call and process data on initialization', () => {
    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy
      });

      jasmine.clock().tick(1);
      expect(serviceCallSpy).toHaveBeenCalledTimes(1);
      expect(dataProcessSpy).toHaveBeenCalledWith('mock data');
      poller.cleanup();
    });
  });

  it('should periodically poll for updates based on the provided interval', () => {
    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy
      });

      jasmine.clock().tick(1);

      for (let i = 1; i <= 3; i++) {
        jasmine.clock().tick(interval);
        expect(serviceCallSpy).toHaveBeenCalledTimes(i + 1);
      }
      poller.cleanup();
    });
  });

  it('should instantly execute a fresh request and reset the interval timeline on manual next() calls', () => {
    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy
      });

      jasmine.clock().tick(1);
      jasmine.clock().tick(interval);
      expect(serviceCallSpy).toHaveBeenCalledTimes(2);

      jasmine.clock().tick(interval / 2);

      poller.next();
      jasmine.clock().tick(1);
      expect(serviceCallSpy).toHaveBeenCalledTimes(3);

      jasmine.clock().tick(interval / 2);
      expect(serviceCallSpy).toHaveBeenCalledTimes(3);

      jasmine.clock().tick(interval / 2);
      expect(serviceCallSpy).toHaveBeenCalledTimes(4);
      poller.cleanup();
    });
  });

  it('should keep background polling alive when encountering network errors', () => {
    serviceCallSpy.and.returnValue(throwError(() => new Error('Network Drop')));

    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy,
        fnOnError: errorSpy
      });

      jasmine.clock().tick(1);
      expect(errorSpy).toHaveBeenCalled();
      expect(serviceCallSpy).toHaveBeenCalledTimes(1);

      jasmine.clock().tick(interval);

      expect(serviceCallSpy).toHaveBeenCalledTimes(2);
      poller.cleanup();
    });
  });

  it('should drop the polling rate down to maxInterval when the tab becomes hidden', () => {
    const maxInterval = 60000;

    // Set the tab as hidden BEFORE initialization to cleanly enforce the throttle
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });

    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        maxInterval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy
      });

      jasmine.clock().tick(1); // Call 1
      expect(serviceCallSpy).toHaveBeenCalledTimes(1);

      // Verify that ticking a normal active interval does NOT make an extra call
      jasmine.clock().tick(interval);
      expect(serviceCallSpy).toHaveBeenCalledTimes(1);

      // Advance up to the long throttled window
      jasmine.clock().tick(maxInterval - interval);
      expect(serviceCallSpy).toHaveBeenCalledTimes(2); // Call 2 happens exactly at maxInterval
      poller.cleanup();
    });
  });

  it('should instantly wake up and restore active polling when tab becomes visible again', () => {
    const maxInterval = 60000;

    // Start hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });

    TestBed.runInInjectionContext(() => {
      const poller = createPoller({
        interval,
        maxInterval,
        fnServiceCall: serviceCallSpy,
        fnDataProcess: dataProcessSpy
      });

      jasmine.clock().tick(1); // Call 1
      expect(serviceCallSpy).toHaveBeenCalledTimes(1);

      // Restore active visibility mid-stream
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false
      });

      // Fire the visibility change event to wake up the outer switchMap
      const event = document.createEvent('Event');
      event.initEvent('visibilitychange', true, true);
      document.dispatchEvent(event);

      jasmine.clock().tick(1); // Flush the switchMap macro-task

      // Verify it instantly executed a fresh request upon wake-up (Call 2)
      expect(serviceCallSpy).toHaveBeenCalledTimes(2);
      poller.cleanup();
    });
  });
});
