import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WorkflowService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl } from '../../../_services';
import { MockWorkflowService, currentWorkflow, MockAuthenticationService, MockTranslateService } from '../../../_mocked';
import { ExecutiontableComponent } from './executiontable.component';

import { TranslatePipe } from '../../../_translate';

describe('ExecutiontableComponent', () => {
  let component: ExecutiontableComponent;
  let fixture: ComponentFixture<ExecutiontableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ ExecutiontableComponent, TranslatePipe ],
      providers: [
        ErrorService,
        RedirectPreviousUrl,
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiontableComponent);
    component = fixture.componentInstance;
    component.execution = currentWorkflow['results'][0];
    component.plugin = currentWorkflow['results'][0]['metisPlugins'][0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel a workflow', () => {
    component.cancelWorkflow('1');
    fixture.detectChanges();
    expect(component.successMessage).not.toBe('');
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
