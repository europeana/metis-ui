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

    component.container = {
      nativeElement: {
        scrollTop: 100
      }
    };
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

  it('should determine if scrollUp is possible', () => {
    expect(component.canScrollUp()).toBeFalsy();
    component.elementList = getFakeElementList();
    expect(component.canScrollUp()).toBeFalsy();
    component.ready = true;
    expect(component.canScrollUp()).toBeTruthy();
  });

  it('should determine if scrollDown is possible', () => {
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
    expect(component.canScrollDown()).toBeTruthy();

    scrollTop = 100;
    expect(component.canScrollDown()).toBeFalsy();

    scrollTop = 50;
    expect(component.canScrollDown()).toBeTruthy();

    offsetHeight = 50;
    expect(component.canScrollDown()).toBeFalsy();

    offsetHeight = 25;
    expect(component.canScrollDown()).toBeTruthy();

    scrollTop = 75;
    expect(component.canScrollDown()).toBeFalsy();

    scrollTop = 0;
    expect(component.canScrollDown()).toBeTruthy();

    component.viewerVisibleIndex = 0;
    expect(component.canScrollDown()).toBeFalsy();
  });

  it('should skip to the item', () => {
    spyOn(component, 'updateViewerVisibleIndex');
    component.ready = true;
    component.skipToItem(0);
    expect(component.updateViewerVisibleIndex).not.toHaveBeenCalled();

    component.elementList = getFakeElementList();

    component.skipToItem(0);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalled();

    component.skipToItem(-1);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalledTimes(2);
  });

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
