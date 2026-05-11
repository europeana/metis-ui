import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, QueryList } from '@angular/core';
import { SkipArrowsComponent } from '.';
import { vi } from 'vitest';

// Mock IntersectionObserver globally for this test suite
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})) as any;

describe('SkipArrowsComponent', () => {
  let component: SkipArrowsComponent;
  let fixture: ComponentFixture<SkipArrowsComponent>;

  const configureTestbed = (): void => {
    TestBed.compileComponents();
    TestBed.configureTestingModule({
      imports: [SkipArrowsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  };

  const b4Each = (): void => {
    vi.useFakeTimers();
    configureTestbed();
    fixture = TestBed.createComponent(SkipArrowsComponent);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    // Clean up timers
    vi.useRealTimers();
  });

  const getFakeElementList = (): QueryList<ElementRef> => {
    return Object.assign(new QueryList(), {
      _results: [
        {
          nativeElement: {
            offsetTop: 100,
            parentNode: {
              scrollTop: 10,
              offsetHeight: 10,
              scrollHeight: 100
            }
          }
        },
        {
          nativeElement: {
            offsetTop: 100,
            parentNode: {
              scrollTop: 10,
              offsetHeight: 10,
              scrollHeight: 100
            }
          }
        }
      ]
    }) as QueryList<ElementRef>;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init', async () => {
    const spy = vi.spyOn(component, 'updateViewerVisibleIndex');

    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();

    // Advance PAST the delay and await it
    await vi.advanceTimersByTimeAsync(component.debounceDelay + 1);
    await Promise.resolve();

    expect(spy).toHaveBeenCalled();
    expect(component.container.nativeElement.scrollTop).toEqual(0);
  });

  it('should get the scrollable parent', () => {
    expect(component.getScrollableParent()).toBeFalsy();
    component.ready = true;
    expect(component.getScrollableParent()).toBeFalsy();
    component.elementList = getFakeElementList();

    expect(component.getScrollableParent()).toBeTruthy();
  });

  it('should update the scroll possibilities', async () => {
    expect(component.canScrollUp()).toBeFalsy();
    expect(component.canScrollUp()).toBeFalsy();

    component.ready = true;
    component.elementList = getFakeElementList();
    component.viewerVisibleIndex = -2;

    let scrollHeight = 0;
    let scrollTop = 0;
    let offsetHeight = 0;

    vi.spyOn(component, 'getScrollableParent').mockImplementation((_?: number) => {
      return ({
        scrollHeight: scrollHeight,
        scrollTop: scrollTop,
        offsetHeight: offsetHeight
      } as unknown) as HTMLElement;
    });

    expect(component.canScrollDown()).toBeFalsy();
    scrollHeight = 100;

    component.updateScrollPossibilities();
    fixture.detectChanges();

    expect(component.canScrollDown()).toBeTruthy();
    expect(component.canScrollUp()).toBeFalsy();

    // For the parts using scrollSubject.next(true):
    scrollTop = 100;
    component.scrollSubject.next(true);

    // 3. Await the timer AND flush microtasks
    await vi.advanceTimersByTimeAsync(component.debounceDelay + 1);
    await Promise.resolve();

    // 4. Update the view/signals
    fixture.detectChanges();

    expect(component.canScrollDown()).toBeFalsy();
    expect(component.canScrollUp()).toBeTruthy();
  });

  it('should skip to the item', async () => {
    const spy = vi.spyOn(component, 'updateViewerVisibleIndex');
    component.ready = true;
    component.elementList = getFakeElementList(); // Set this first

    component.skipToItem(0);

    await vi.advanceTimersByTimeAsync(component.debounceDelay + 1);
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should scroll', () => {
    vi.spyOn(component.scrollSubject, 'next');
    component.onScroll();
    expect(component.scrollSubject.next).toHaveBeenCalled();
  });

  it('should update the visible index', () => {
    component.elementList = getFakeElementList();
    component.viewerVisibleIndex = -1;

    component.updateViewerVisibleIndex();
    expect(component.viewerVisibleIndex).toEqual(-1);

    component.viewerVisibleIndex = -1;
    component.elementList.get(0)!.nativeElement.offsetTop = 0;

    component.updateViewerVisibleIndex();
    expect(component.viewerVisibleIndex).toEqual(0);
  });
});
