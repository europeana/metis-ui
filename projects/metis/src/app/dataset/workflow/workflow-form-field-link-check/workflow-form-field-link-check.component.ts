import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { ParameterFieldName, WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field-link-check',
  templateUrl: './workflow-form-field-link-check.component.html',
  styleUrls: ['./workflow-form-field-link-check.component.scss']
})
export class WorkflowFormFieldLinkCheckComponent {
  public ParameterFieldName = ParameterFieldName;
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: UntypedFormGroup;
}
