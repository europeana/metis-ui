import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { createMockPipe } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { WorkflowFormFieldMediaProcessComponent } from '.';

describe('WorkflowFormFieldMediaProcessComponent', () => {
  let component: WorkflowFormFieldMediaProcessComponent;
  let fixture: ComponentFixture<WorkflowFormFieldMediaProcessComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WorkflowFormFieldMediaProcessComponent, createMockPipe('translate')],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: FormBuilder, useValue: formBuilder }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormFieldMediaProcessComponent);
    component = fixture.componentInstance;
    component.conf = {
      label: PluginType.MEDIA_PROCESS,
      name: 'pluginMEDIA_PROCESS',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.throttlingLevel]
    };
    component.workflowForm = formBuilder.group({
      pluginMEDIA_PROCESS: null,
      throttlingLevel: null
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
