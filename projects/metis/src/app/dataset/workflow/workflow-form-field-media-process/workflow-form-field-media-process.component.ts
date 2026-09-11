import { Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ParameterFieldName, ThrottleLevel, WorkflowFieldData } from '../../../_models';
import { TranslatePipe } from '../../../_translate';

@Component({
  selector: 'app-workflow-form-field-media-process',
  templateUrl: './workflow-form-field-media-process.component.html',
  styleUrls: ['./workflow-form-field-media-process.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, NgTemplateOutlet, TranslatePipe]
})
export class WorkflowFormFieldMediaProcessComponent {
  public ParameterFieldName = ParameterFieldName;
  public ThrottleLevel = ThrottleLevel;

  conf = input.required<WorkflowFieldData>();
  workflowForm = input.required<FormGroup>();
}
