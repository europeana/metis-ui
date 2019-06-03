import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { TranslateService } from '../../../_translate';

import { WorkflowHeaderComponent } from '.';

describe('WorkflowHeaderComponent', () => {
  let component: WorkflowHeaderComponent;
  let fixture: ComponentFixture<WorkflowHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkflowHeaderComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowHeaderComponent);
    component = fixture.componentInstance;
    component.conf = [];
    fixture.detectChanges();
  });

  it('should respond to orb clicks', () => {
    spyOn(component.headerOrbClicked, 'emit');
    component.activatePlugin('test');
    expect(component.headerOrbClicked.emit).toHaveBeenCalled();
  });
});
