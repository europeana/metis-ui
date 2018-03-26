import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset, xslt } from '../../_mocked';

import { DatasetsService, WorkflowService, TranslateService, RedirectPreviousUrl, ErrorService, AuthenticationService } from '../../_services';

import { MappingComponent } from './mapping.component';

import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { XmlPipe }   from '../../_helpers';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, CodemirrorModule, FormsModule ],
      declarations: [ MappingComponent, TranslatePipe, XmlPipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        },
        RedirectPreviousUrl,
        ErrorService,
        AuthenticationService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    component.datasetData = currentDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expand a statistics', () => {
    component.toggleStatistics();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length).toBeTruthy();
  });

  it('should display xslt', () => {
    component.loadXSLT('default');
    component.fullView = true;
    fixture.detectChanges();    
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });

  it('should save xslt', () => {
    component.fullView = true;
    component.loadXSLT('default');
    fixture.detectChanges();
    
    const save = fixture.debugElement.query(By.css('.btns-set-save button'));
    save.triggerEventHandler('click', null);
    fixture.detectChanges();    
    expect(component.xsltType).toBe('custom');
  });

  it('should not display messages', () => {
    component.successMessage = 'test';
    component.closeMessages();
    fixture.detectChanges(); 
    expect(component.successMessage).toBe(undefined);
  });

  it('should display xslt in cards', () => {
    component.fullView = false;
    component.loadXSLT('default');
    fixture.detectChanges();      
    expect(component.xslt.length).not.toBe(1);
  });

  it('should expand xslt card', () => {
    component.fullView = false;
    component.loadXSLT('default');
    fixture.detectChanges();    
    component.expandSample(1);    
    expect(component.expandedSample).toBe(1);
  });

  it('should save xslt', () => {
    component.fullView = false;
    component.loadXSLT('default');
    fixture.detectChanges();
    
    const save = fixture.debugElement.query(By.css('.btns-set-save button'));
    save.triggerEventHandler('click', null);
    fixture.detectChanges();    
    expect(component.xsltType).toBe('custom');
  });


});
