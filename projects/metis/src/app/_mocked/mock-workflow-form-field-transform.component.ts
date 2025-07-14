import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WorkflowFieldData } from '../_models';

@Component({
  selector: 'app-workflow-form-field-transform',
  template: ''
})
export class MockWorkflowFormFieldTransformComponent {
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
  @Input() customXsltAllowed = false;
}
