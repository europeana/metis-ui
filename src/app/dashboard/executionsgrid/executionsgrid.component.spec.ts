import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockTranslateService, MockWorkflowService } from '../../_mocked';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { ExecutionsgridComponent } from '.';
import { GridrowComponent } from './gridrow';

function setRows(component: ExecutionsgridComponent): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component.rows = ([{ expanded: true }, { expanded: true }] as any) as QueryList<GridrowComponent>;
}

describe('ExecutionsgridComponent', () => {
  let component: ExecutionsgridComponent;
  let fixture: ComponentFixture<ExecutionsgridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        ExecutionsgridComponent,
        createMockPipe('renameWorkflow'),
        createMockPipe('translate')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: WorkflowService, useClass: MockWorkflowService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsgridComponent);
    component = fixture.componentInstance;
  });

  it('should load', fakeAsync(() => {
    expect(component.isLoading).toBe(true);
    expect(component.dsOverview).toBeFalsy();
    component.load();
    tick();
    expect(component.dsOverview.length).toBeGreaterThan(0);
    expect(component.isLoading).toBe(false);
    expect(component.isLoadingMore).toBe(false);
    expect(component.currentPage).toEqual(0);
    component.finishedTimer.unsubscribe();
  }));

  it('should load on init', () => {
    spyOn(component, 'load');
    component.ngAfterViewInit();
    expect(component.load).toHaveBeenCalled();
  });

  it('should call load when the params are set', () => {
    spyOn(component, 'load');
    component.setOverviewParams('param-string');
    expect(component.load).toHaveBeenCalled();
  });

  it('should load the next page', () => {
    component.load();
    expect(component.currentPage).toEqual(0);
    component.loadNextPage();
    expect(component.currentPage).toEqual(1);
  });

  it('should set the selected index', () => {
    setRows(component);
    expect(component.selectedDsId).toEqual('');
    component.setSelectedDsId('3');
    expect(component.selectedDsId).toEqual('3');
  });

  it('should relay the row selection to the parent', () => {
    spyOn(component.selectedSet, 'emit');
    setRows(component);
    component.setSelectedDsId('id');
    expect(component.selectedSet.emit).toHaveBeenCalled();
  });
});
