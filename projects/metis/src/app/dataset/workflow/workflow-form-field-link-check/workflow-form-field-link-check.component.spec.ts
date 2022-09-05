import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { createMockPipe } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { WorkflowFormFieldLinkCheckComponent } from '.';

describe('WorkflowFormFieldLinkCheckComponent', () => {
  let component: WorkflowFormFieldLinkCheckComponent;
  let fixture: ComponentFixture<WorkflowFormFieldLinkCheckComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WorkflowFormFieldLinkCheckComponent, createMockPipe('translate')],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: UntypedFormBuilder, useValue: formBuilder }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormFieldLinkCheckComponent);
    component = fixture.componentInstance;
    component.conf = {
      label: PluginType.LINK_CHECKING,
      name: 'pluginLINK_CHECKING',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.performSampling]
    };
    component.workflowForm = formBuilder.group({
      pluginLINK_CHECKING: null,
      performSampling: null
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
