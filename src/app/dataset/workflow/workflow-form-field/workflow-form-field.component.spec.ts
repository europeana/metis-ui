import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { DragType, PluginType } from '../../../_models';
import { TranslateService } from '../../../_translate';

import { WorkflowFormFieldComponent } from '.';

describe('WorkflowFormFieldComponent', () => {
  let component: WorkflowFormFieldComponent;
  let fixture: ComponentFixture<WorkflowFormFieldComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        WorkflowFormFieldComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
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

  it('should emit events when the field changes', () => {
    const fName = 'name';
    spyOn(component.fieldChanged, 'emit');
    component.onFieldChanged(fName);
    expect(component.fieldChanged.emit).toHaveBeenCalledWith(fName);
  });
});
