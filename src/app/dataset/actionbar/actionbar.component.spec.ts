import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService, WorkflowService, AuthenticationService } from '../../_services';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActionbarComponent } from './actionbar.component';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let WorkflowServiceStub;
  let WorkflowService;

  beforeEach(() => {

     WorkflowServiceStub = { 
      cancelling: false,
      createdDate: '2018-01-23T08:39:20.891Z',
      datasetId: 82,
      ecloudDatasetId: '73d5a6d3-88cf-4c79-a8cd-805fc9c2027c',
      finishedDate: null,
      id: '5a66f4b86e1f3400075693d9',
      metisPlugins: [],
      startedDate: null,
      updatedDate: null,
      workflowName: 'workflow30',
      workflowOwner: 'owner1',
      workflowPriority: 0,
      workflowStatus: 'INQUEUE'
    }

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ ActionbarComponent ],
      providers: [ {provide: WorkflowService, useValue: WorkflowServiceStub }, AuthenticationService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    WorkflowService = TestBed.get(WorkflowService);

  });

  it('should create', () => {    
    expect(component).toBeTruthy();
  });

  it('should do click to show logging', fakeAsync((): void => {

    let button = fixture.debugElement.query(By.css('.log-btn'));
    if (button) {
      spyOn(component.notifyShowLogStatus, 'emit');
      button.nativeElement.click();

      fixture.detectChanges();
      tick();

      expect(component.notifyShowLogStatus.emit).toHaveBeenCalled();

    } 
    
  }));



});
