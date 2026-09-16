import { DestroyRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';
import { createPoller } from './data-poller';

describe('createPoller Utility', () => {
  const interval = 5000;
  let serviceCallSpy: Mock;
  let dataProcessSpy: Mock;
  let errorSpy: Mock;
  let mockDestroyRef: DestroyRef;

  beforeEach(() => {
    vi.useFakeTimers();
    serviceCallSpy = vi.fn().mockReturnValue(of('mock data'));
    dataProcessSpy = vi.fn();
    errorSpy = vi.fn();

    mockDestroyRef = ({
      onDestroy: vi.fn()
    } as unknown) as DestroyRef;

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should immediately trigger the service call and process data on initialization', () => {
    createPoller({
      interval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy
    });

    vi.advanceTimersByTime(1);
    expect(serviceCallSpy).toHaveBeenCalledTimes(1);
    expect(dataProcessSpy).toHaveBeenCalledWith('mock data');
  });

  it('should periodically poll for updates based on the provided interval', () => {
    createPoller({
      interval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy
    });

    vi.advanceTimersByTime(1);

    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(interval);
      expect(serviceCallSpy).toHaveBeenCalledTimes(i + 1);
    }
  });

  it('should instantly execute a fresh request and reset the interval timeline on manual next() calls', () => {
    const poller = createPoller({
      interval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy
    });

    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(interval);
    expect(serviceCallSpy).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(interval / 2);

    poller.next();
    vi.advanceTimersByTime(1);
    expect(serviceCallSpy).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(interval / 2);
    expect(serviceCallSpy).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(interval / 2);
    expect(serviceCallSpy).toHaveBeenCalledTimes(4);
  });

  it('should keep background polling alive when encountering network errors', () => {
    serviceCallSpy.mockReturnValue(throwError(() => new Error('Network Drop')));

    createPoller({
      interval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy,
      fnOnError: errorSpy
    });

    vi.advanceTimersByTime(1);
    expect(errorSpy).toHaveBeenCalled();
    expect(serviceCallSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(interval);

    expect(serviceCallSpy).toHaveBeenCalledTimes(2);
  });

  it('should drop the polling rate down to maxInterval when the tab becomes hidden', () => {
    const maxInterval = 60000;

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });

    createPoller({
      interval,
      maxInterval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy
    });

    vi.advanceTimersByTime(1);
    expect(serviceCallSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(interval);
    expect(serviceCallSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(maxInterval - interval);
    expect(serviceCallSpy).toHaveBeenCalledTimes(2);
  });

  it('should instantly wake up and restore active polling when tab becomes visible again', () => {
    const maxInterval = 60000;

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });

    createPoller({
      interval,
      maxInterval,
      destroyRef: mockDestroyRef,
      fnServiceCall: serviceCallSpy,
      fnDataProcess: dataProcessSpy
    });

    vi.advanceTimersByTime(1);
    expect(serviceCallSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });

    const event = document.createEvent('Event');
    event.initEvent('visibilitychange', true, true);
    document.dispatchEvent(event);

    vi.advanceTimersByTime(1);

    expect(serviceCallSpy).toHaveBeenCalledTimes(2);
  });
});
