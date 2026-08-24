import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockRecordData } from '../_mocked';
import { GridPaginatorComponent } from '.';

describe('GridPaginatorComponent', () => {
  let component: GridPaginatorComponent;
  let fixture: ComponentFixture<GridPaginatorComponent>;

  const testRows = mockRecordData;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [GridPaginatorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(GridPaginatorComponent);
    fixture.componentRef.setInput('rows', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect if next is available', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('maxPageSize', 2);
      fixture.componentRef.setInput('rows', testRows.slice(0, -1));
    });
    expect(component.canNext()).toBeTruthy();
    component.activePageIndex.set(5);
    expect(component.canNext()).toBeFalsy();
  });

  it('should detect if previous is available', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('maxPageSize', 2);
      fixture.componentRef.setInput('rows', testRows.slice(0, -1));
    });
    expect(component.canPrev()).toBeFalsy();
    component.activePageIndex.set(3);
    expect(component.canPrev()).toBeTruthy();
  });

  it('should calculate the pages', () => {
    expect(component.pagesAndRanges().ranges.length).toBeFalsy();
    expect(component.totalRows()).toBeFalsy();
    expect(component.totalPageCount()).toBeFalsy();

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('rows', testRows.slice(0, 10));
    });

    expect(component.pagesAndRanges().ranges.length).toBeTruthy();
    expect(component.totalRows()).toBeTruthy();
    expect(component.totalPageCount()).toBeTruthy();
  });

  it('should recalculate the pages when the pagination size changes', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('rows', testRows.slice(0));
    });
    fixture.detectChanges();
    expect(component.pagesAndRanges().pages).toBeTruthy();
    vi.spyOn(component.change, 'emit');

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('maxPageSize', 2);
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.change.emit).toHaveBeenCalled();
    expect(component.rows()).toBeTruthy();
  });

  it('should set the page', () => {
    vi.spyOn(component.change, 'emit');
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('rows', testRows.slice(0));
    });
    component.setPage(1);
    fixture.detectChanges();
    expect(component.change.emit).toHaveBeenCalled();
  });

  it('should set the page (wrapper)', () => {
    let fakeDisabled: string | null = 'disabled';

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('rows', testRows.slice(0));
    });
    vi.spyOn(component.change, 'emit');

    const fakeEvent = ({
      preventDefault: (): void => {
        console.log('');
      },
      target: {
        getAttribute: (_: string): string | null => {
          return fakeDisabled;
        }
      }
    } as unknown) as Event;

    component.callSetPage(fakeEvent, 1);
    expect(component.change.emit).not.toHaveBeenCalled();

    fakeDisabled = null;
    component.callSetPage(fakeEvent, 1);
    fixture.detectChanges();
    expect(component.change.emit).toHaveBeenCalled();
  });
});
