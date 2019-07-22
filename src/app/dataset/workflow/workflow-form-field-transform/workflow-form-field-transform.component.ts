import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field-transform',
  templateUrl: './workflow-form-field-transform.component.html',
  styleUrls: ['./workflow-form-field-transform.component.scss']
})
export class WorkflowFormFieldTransformComponent {
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
}
