import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { MockTranslateService, MockWorkflowFormFieldTransformComponent } from '../../../_mocked';
import { DragType, PluginType } from '../../../_models';
import { RenameWorkflowPipe, TranslateService } from '../../../_translate';
import { WorkflowFormFieldTransformComponent } from '../';
import { WorkflowFormFieldComponent } from '.';

describe('WorkflowFormFieldComponent', () => {
  let component: WorkflowFormFieldComponent;
  let fixture: ComponentFixture<WorkflowFormFieldComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgClass, WorkflowFormFieldComponent, WorkflowFormFieldTransformComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        },
        { provide: UntypedFormBuilder, useValue: formBuilder }
      ]
    })
      .overrideComponent(WorkflowFormFieldComponent, {
        remove: { imports: [WorkflowFormFieldTransformComponent] },
        add: { imports: [MockWorkflowFormFieldTransformComponent] }
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkflowFormFieldComponent);
    component = fixture.componentInstance;

    component.conf = {
      label: PluginType.TRANSFORMATION,
      name: 'pluginTRANSFORMATION',
      dragType: DragType.dragNone
    };
    component.workflowForm = formBuilder.group({
      pluginTRANSFORMATION: null
    });

    fixture.detectChanges();
  });

  it('should indicate if inactive', () => {
    expect(component.isInactive()).toBeTruthy();
    component.conf.name = 'pluginLINK_CHECKING';
    expect(component.isInactive()).toBeFalsy();
  });

  it('should emit events when link checking gets set', () => {
    spyOn(component.setLinkCheck, 'emit');
    component.ctrlSetLinkCheck(0);
    fixture.detectChanges();
    expect(component.setLinkCheck.emit).toHaveBeenCalled();
  });

  it('should scroll elements into view', () => {
    spyOn(component.pluginElement.nativeElement, 'scrollIntoView');
    component.scrollToInput();
    expect(component.pluginElement.nativeElement.scrollIntoView).toHaveBeenCalled();
  });
});
