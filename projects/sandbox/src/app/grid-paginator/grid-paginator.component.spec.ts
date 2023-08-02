import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockRecordData } from '../_mocked';
import { GridPaginatorComponent } from '.';

describe('GridPaginatorComponent', () => {
  let component: GridPaginatorComponent;
  let fixture: ComponentFixture<GridPaginatorComponent>;

  const testRows = mockRecordData;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [GridPaginatorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect if next is available', () => {
    component.activePageIndex = 1;
    component.totalPageCount = 3;
    expect(component.canNext()).toBeTruthy();
    component.activePageIndex = 3;
    expect(component.canNext()).toBeFalsy();
  });

  it('should detect if previous is available', () => {
    component.activePageIndex = 0;
    component.totalPageCount = 3;
    expect(component.canPrev()).toBeFalsy();
    component.activePageIndex = 3;
    expect(component.canPrev()).toBeTruthy();
  });

  it('should calculate the pages', () => {
    expect(component.ranges).toBeFalsy();
    expect(component.totalRows).toBeFalsy();
    expect(component.totalPageCount).toBeFalsy();

    component.calculatePages(testRows.slice(0));
    expect(component.ranges).toBeTruthy();
    expect(component.totalRows).toBeTruthy();
    expect(component.totalPageCount).toBeTruthy();
  });

  it('should recalculate the pages when the page size changes', () => {
    component.rows = testRows.slice(0);
    fixture.detectChanges();
    expect(component.pages).toBeTruthy();
    spyOn(component, 'setPage');
    spyOn(component, 'calculatePages');
    component.maxPageSize = 2;
    expect(component.setPage).toHaveBeenCalled();
    expect(component.calculatePages).toHaveBeenCalled();
    expect(component.rows).toBeTruthy();
  });

  it('should set the page', () => {
    spyOn(component.change, 'emit');
    component.rows = testRows.slice(0);
    component.setPage(1);
    expect(component.change.emit).toHaveBeenCalled();
  });

  it('should set the page (wrapper)', () => {
    let fakeDisabled: string | null = 'disabled';
    component.rows = testRows.slice(0);
    spyOn(component.change, 'emit');

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
    expect(component.change.emit).toHaveBeenCalled();
  });
});
