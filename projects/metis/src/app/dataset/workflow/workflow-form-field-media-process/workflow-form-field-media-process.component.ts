import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParameterFieldName, ThrottleLevel, WorkflowFieldData } from '../../../_models';
import { TranslatePipe } from '../../../_translate/translate.pipe';
import { NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-workflow-form-field-media-process',
  templateUrl: './workflow-form-field-media-process.component.html',
  styleUrls: ['./workflow-form-field-media-process.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgTemplateOutlet, TranslatePipe]
})
export class WorkflowFormFieldMediaProcessComponent {
  public ParameterFieldName = ParameterFieldName;
  public ThrottleLevel = ThrottleLevel;
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
}
