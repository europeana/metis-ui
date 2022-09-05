import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ParameterFieldName, ThrottleLevel, WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field-media-process',
  templateUrl: './workflow-form-field-media-process.component.html',
  styleUrls: ['./workflow-form-field-media-process.component.scss']
})
export class WorkflowFormFieldMediaProcessComponent {
  public ParameterFieldName = ParameterFieldName;
  public ThrottleLevel = ThrottleLevel;
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: UntypedFormGroup;
}
