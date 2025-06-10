import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ElementRef, QueryList } from '@angular/core';
import { SkipArrowsComponent } from '.';

describe('SkipArrowsComponent', () => {
  let component: SkipArrowsComponent;
  let fixture: ComponentFixture<SkipArrowsComponent>;

  const configureTestbed = (): void => {
    TestBed.compileComponents();
    TestBed.configureTestingModule({
      imports: [SkipArrowsComponent]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(SkipArrowsComponent);
    component = fixture.componentInstance;
  };

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

  it('should init', fakeAsync(() => {
    spyOn(component, 'updateViewerVisibleIndex');
    fixture.detectChanges();
    component.ngAfterViewInit();
    expect(component.updateViewerVisibleIndex).not.toHaveBeenCalled();
    tick(100);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalled();
    expect(component.container.nativeElement.scrollTop).toEqual(0);
  }));

  it('should get the scrollable parent', () => {
    expect(component.getScrollableParent()).toBeFalsy();
    component.ready = true;
    expect(component.getScrollableParent()).toBeFalsy();
    component.elementList = getFakeElementList();

    expect(component.getScrollableParent()).toBeTruthy();
  });

  it('should update the scroll possibilities', fakeAsync(() => {
    expect(component.canScrollUp()).toBeFalsy();
    expect(component.canScrollUp()).toBeFalsy();

    component.ready = true;
    component.elementList = getFakeElementList();
    component.viewerVisibleIndex = -2;

    let scrollHeight = 0;
    let scrollTop = 0;
    let offsetHeight = 0;

    spyOn(component, 'getScrollableParent').and.callFake((_: number) => {
      return ({
        scrollHeight: scrollHeight,
        scrollTop: scrollTop,
        offsetHeight: offsetHeight
      } as unknown) as HTMLElement;
    });

    expect(component.canScrollDown()).toBeFalsy();
    scrollHeight = 100;

    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeTruthy();
    expect(component.canScrollUp()).toBeFalsy();

    scrollTop = 100;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeFalsy();
    expect(component.canScrollUp()).toBeTruthy();

    scrollTop = 50;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeTruthy();
    expect(component.canScrollUp()).toBeTruthy();

    offsetHeight = 50;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeFalsy();
    expect(component.canScrollUp()).toBeTruthy();

    offsetHeight = 25;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeTruthy();
    expect(component.canScrollUp()).toBeTruthy();

    scrollTop = 75;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeFalsy();
    expect(component.canScrollUp()).toBeTruthy();

    scrollTop = 0;
    component.scrollSubject.next(true);
    fixture.detectChanges();
    tick(component.debounceDelay);
    expect(component.canScrollDown()).toBeTruthy();
    expect(component.canScrollUp()).toBeFalsy();
  }));

  it('should skip to the item', fakeAsync(() => {
    spyOn(component, 'updateViewerVisibleIndex');
    component.ready = true;
    component.skipToItem(0);
    fixture.detectChanges();
    expect(component.updateViewerVisibleIndex).not.toHaveBeenCalled();
    tick(component.debounceDelay);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalledTimes(1);
    component.elementList = getFakeElementList();
    component.skipToItem(0);
    tick(component.debounceDelay);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalledTimes(2);
    component.skipToItem(-1);
    tick(component.debounceDelay);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalledTimes(3);
  }));

  it('should scroll', () => {
    spyOn(component.scrollSubject, 'next');
    component.onScroll();
    expect(component.scrollSubject.next).toHaveBeenCalled();
  });

  it('should update the visible index', () => {
    component.elementList = getFakeElementList();
    component.viewerVisibleIndex = -1;

    component.updateViewerVisibleIndex();
    expect(component.viewerVisibleIndex).toEqual(-1);

    // reset
    component.viewerVisibleIndex = -1;
    component.elementList.get(0)!.nativeElement.offsetTop = 0;

    component.updateViewerVisibleIndex();
    expect(component.viewerVisibleIndex).toEqual(0);
  });
});
