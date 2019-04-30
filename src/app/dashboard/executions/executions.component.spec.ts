import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe, mockWorkflowExecution } from '../../_mocked';

import { ExecutionsComponent } from '.';

describe('ExecutionsComponent', () => {
  let component: ExecutionsComponent;
  let fixture: ComponentFixture<ExecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutionsComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the next page', () => {
    spyOn(component.nextPage, 'emit');
    component.loadNextPage();
    expect(component.nextPage.emit).toHaveBeenCalledWith();
  });

  it('should have a tracking function', () => {
    expect(component.byId(10, mockWorkflowExecution)).toBe('253453453');
  });
});
