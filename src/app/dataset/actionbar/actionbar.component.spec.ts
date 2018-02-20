import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService, WorkflowService, AuthenticationService, ErrorService, RedirectPreviousUrl, TranslateService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Observable } from 'rxjs/Observable';
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionbarComponent } from './actionbar.component';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ ActionbarComponent, TranslatePipe ],
      providers:    [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        AuthenticationService, 
        ErrorService, 
        RedirectPreviousUrl,
        { provide: TranslateService,
            useValue: {
              translate: () => {
                return {};
              }
            }
        }]       
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionbarComponent);
    component    = fixture.componentInstance;   
  });

  it('should create', () => {    
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should return last execution and start polling a running execution', () => {    
    fixture.detectChanges();
    component.datasetData = currentDataset;
    component.returnLastExecution();

    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dataset-actionbar .progressbar')).length).toBeTruthy();

  });

  /*it('should handle a finished execution', () => {    
    fixture.detectChanges();
    currentWorkflow.workflowStatus = 'FINISHED';
    currentWorkflow.metisPlugins[0].pluginStatus = 'FINISHED';
    component.returnLastExecution();
  });*/

  it('should do click to show logging', fakeAsync((): void => {

    component.currentWorkflow = currentWorkflow;
    fixture.detectChanges();

    let button = fixture.debugElement.query(By.css('.log-btn'));
    if (button) {
      spyOn(component.notifyShowLogStatus, 'emit');
      button.nativeElement.click();

      fixture.detectChanges();
      tick();

      expect(component.notifyShowLogStatus.emit).toHaveBeenCalled();
    } 
  }));


  it('should open workflow filter', (): void => {       
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'FINISHED';
    fixture.detectChanges();

    const workflow = fixture.debugElement.query(By.css('.dataset-actionbar nav .newaction-btn'));
    if (workflow) {
      workflow.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.workflow-selector')).length).toBeTruthy();

      component.allWorkflows = ['mocked'];
      const filter = fixture.debugElement.query(By.css('.workflow-selector a'));
      filter.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.workflow-selector')).length).not.toBeTruthy();

      component.onClickedOutsideWorkflow();
      fixture.detectChanges();
    }
  });  


  it('should cancel', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();

    const cancel = fixture.debugElement.query(By.css('.dataset-actionbar nav .cancel-btn'));
    if (cancel) {
      cancel.triggerEventHandler('click', null);
      fixture.detectChanges();
    }
  });


  it('should have a running workflow', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress') === null).toBe(false);
  });

});
