import { WorkflowService, ErrorService, AuthenticationService, RedirectPreviousUrl, TranslateService, DatasetsService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset, MockAuthenticationService, currentUser } from '../../_mocked';
import { TRANSLATION_PROVIDERS, TranslatePipe } from '../../_translate';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { OngoingexecutionsComponent } from './ongoingexecutions.component';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ OngoingexecutionsComponent, TranslatePipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService},
        DatasetsService,
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService},
        RedirectPreviousUrl,
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
    fixture = TestBed.createComponent(OngoingexecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show a log', () => {
    spyOn(component.notifyShowLogStatus, 'emit');
    component.showLog('1', 'mocked', 'testplugin');
    fixture.detectChanges();
    expect(component.notifyShowLogStatus.emit).toHaveBeenCalled();
  });

  it('should click view all', () => {
    component.viewAll();
    fixture.detectChanges();
    expect(window.pageYOffset).toBe(0);
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });

  it('should get ongoing executions', () => {
    component.ongoingExecutionsTotal = 1;
    component.ongoingExecutionDataOutput = [currentWorkflow['results'][1]];
    component.getOngoing();
    fixture.detectChanges();
    expect(component.ongoingExecutions.length).not.toBe(0);
  });

});
