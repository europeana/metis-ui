import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { createMockPipe, mockHarvestData, mockWorkflowExecutionResults } from '../../_mocked';
import { TabHeadersComponent } from '.';

describe('TabHeadersComponent', () => {
  let component: TabHeadersComponent;
  let fixture: ComponentFixture<TabHeadersComponent>;
  let router: Router;
  const params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabHeadersComponent, createMockPipe('translate')],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params }
        }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(router).toBeTruthy();
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

  //it('should redirect', () => {
  //  spyOn(router, 'navigate');
  //  /params.next({ tab: 'new' } as Params);
  //  fixture.detectChanges();
  //  expect(router.navigate).toHaveBeenCalled();
  //});
});
