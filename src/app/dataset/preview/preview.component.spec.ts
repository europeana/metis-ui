import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

import { PreviewComponent } from './preview.component';
import { WorkflowService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl, DatasetsService } from '../../_services';

import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { XmlPipe }   from '../../_helpers';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let tempWorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, FormsModule, CodemirrorModule ],
      declarations: [ PreviewComponent, TranslatePipe, XmlPipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        ErrorService, 
        AuthenticationService, 
        RedirectPreviousUrl, 
        DatasetsService,
      { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display filters and trigger', (): void => {    
    component.datasetData = currentDataset; 
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.filter .dropdown-workflow')).length).toBeTruthy();

    component.toggleFilterWorkflow();
    fixture.detectChanges();
    const workflow = fixture.debugElement.query(By.css('.filter .dropdown-workflow ul a'));
    workflow.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.filter .dropdown-date')).length).toBeTruthy();

    component.toggleFilterDate();
    fixture.detectChanges();
    const date = fixture.debugElement.query(By.css('.filter .dropdown-date ul a'));
    date.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.filter .dropdown-plugin')).length).toBeTruthy();

    component.toggleFilterPlugin();
    fixture.detectChanges();
    const plugin = fixture.debugElement.query(By.css('.filter .dropdown-plugin ul a'));
    plugin.triggerEventHandler('click', null);
    fixture.detectChanges();    
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();

  });

  it('prefill filters', (): void => {  
    component.datasetData = currentDataset; 
    component.prefill = {workflow: 'mocked', date: currentWorkflow['results'][0], plugin: 'MOCKED'};
    component.prefillFilters();
    fixture.detectChanges();    
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
  });

  it('expand sample', (): void => {  
    component.datasetData = currentDataset; 
    component.prefill = {workflow: 'mocked', date: currentWorkflow['results'][0], plugin: 'MOCKED'};
    component.prefillFilters();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });
});
