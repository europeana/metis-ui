import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

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
      imports: [RouterTestingModule, ReactiveFormsModule],
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

  it('should have different scroll behaviours', () => {
    expect(component.pluginElement.nativeElement.classList.contains('returning')).toBeFalsy();
    component.scrollToInput(true);
    expect(component.pluginElement.nativeElement.classList.contains('returning')).toBeTruthy();
    component.scrollToInput();
    expect(component.pluginElement.nativeElement.classList.contains('returning')).toBeFalsy();
  });

  it('should emit events when the field value changes', () => {
    spyOn(component.fieldChanged, 'emit');
    document.querySelector('input')!.click();
    fixture.detectChanges();
    expect(component.fieldChanged.emit).toHaveBeenCalled();
  });
});
