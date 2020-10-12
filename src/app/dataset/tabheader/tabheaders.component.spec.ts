import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { createMockPipe, mockHarvestData, mockWorkflowExecutionResults } from '../../_mocked';
import { TabHeadersComponent } from '.';

describe('TabHeadersComponent', () => {
  let component: TabHeadersComponent;
  let fixture: ComponentFixture<TabHeadersComponent>;
  const params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabHeadersComponent, createMockPipe('translate')],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the harvest data', () => {
    expect(component.harvestPublicationData).toBeFalsy();
    component.harvestData = mockHarvestData;
    expect(component.harvestPublicationData).toBeTruthy();
    expect(component.harvestPublicationData).toEqual(mockHarvestData);
  });

  it('should set the active tab', () => {
    const tabName = 'The Tab';
    expect(component.activeTab).toBeFalsy();
    component.active = tabName;
    expect(component.activeTab).toBeTruthy();
    expect(component.activeTab).toEqual(tabName);
  });

  it('should set the last execution data', () => {
    const lastExec = mockWorkflowExecutionResults.results[0];
    expect(component.lastExecutionData).toBeFalsy();
    component.lastExecution = lastExec;
    expect(component.lastExecutionData).toBeTruthy();
    expect(component.lastExecutionData).toEqual(lastExec);
  });
});
