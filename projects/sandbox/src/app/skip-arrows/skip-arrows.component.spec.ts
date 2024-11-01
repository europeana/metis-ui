import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
        }
      ]
    }) as QueryList<ElementRef>;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init', fakeAsync(() => {
    spyOn(component, 'updateViewerVisibleIndex');
    component.ngOnInit();
    expect(component.updateViewerVisibleIndex).not.toHaveBeenCalled();
    tick(100);
    expect(component.updateViewerVisibleIndex).toHaveBeenCalled();
  }));

  it('should get the scrollable parent', () => {
    expect(component.getScrollableParent()).toBeFalsy();
    component.elementList = getFakeElementList();
    expect(component.getScrollableParent()).toBeTruthy();
  });

  it('should determine if scrollUp is possible', () => {
    expect(component.canScrollUp()).toBeFalsy();
    component.elementList = getFakeElementList();
    expect(component.canScrollUp()).toBeTruthy();
  });

  it('should determine if scrollDown is possible', () => {
    expect(component.canScrollDown()).toBeFalsy();
    component.elementList = getFakeElementList();
    expect(component.canScrollDown()).toBeTruthy();
  });

  it('should skip to the item', () => {
    spyOn(component, 'updateViewerVisibleIndex');

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
