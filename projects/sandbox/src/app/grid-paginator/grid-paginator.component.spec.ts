import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRow } from '../_models';
import { GridPaginatorComponent } from '.';

describe('GridPaginatorComponent', () => {
  let component: GridPaginatorComponent;
  let fixture: ComponentFixture<GridPaginatorComponent>;

  const testRows = [
    {
      name: 'A',
      count: 1,
      percent: 2
    },
    {
      name: 'B',
      count: 2,
      percent: 2
    },
    {
      name: 'B',
      count: 3,
      percent: 1,
      isTotal: true
    },
    {
      name: 'C',
      count: 0,
      percent: 1
    },
    {
      name: 'D',
      count: 2,
      percent: 1
    }
  ] as Array<TableRow>;

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
    spyOn(component.change, 'emit');
    component.rows = testRows.slice(0);
    component.callSetPage(
      {
        preventDefault: (): void => {
          console.log('');
        }
      } as unknown as Event,
      1
    );
    expect(component.change.emit).toHaveBeenCalled();
  });
});
