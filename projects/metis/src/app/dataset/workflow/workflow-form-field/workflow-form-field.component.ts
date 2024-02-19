import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ProtocolFieldSetComponent, ProtocolType } from 'shared';
import { WorkflowFieldData } from '../../../_models';
import { RenameWorkflowPipe } from '../../../_translate/rename-workflow.pipe';
import { WorkflowFormFieldTransformComponent } from '../workflow-form-field-transform/workflow-form-field-transform.component';
import { WorkflowFormFieldLinkCheckComponent } from '../workflow-form-field-link-check/workflow-form-field-link-check.component';
import { WorkflowFormFieldMediaProcessComponent } from '../workflow-form-field-media-process/workflow-form-field-media-process.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-workflow-form-field',
  templateUrl: './workflow-form-field.component.html',
  styleUrls: ['./workflow-form-field.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    WorkflowFormFieldMediaProcessComponent,
    WorkflowFormFieldLinkCheckComponent,
    WorkflowFormFieldTransformComponent,
    RenameWorkflowPipe,
    ProtocolFieldSetComponent
  ]
})
export class WorkflowFormFieldComponent {
  @Input() conf: WorkflowFieldData;
  @Input() index: number;
  @Input() workflowForm: UntypedFormGroup;
  @Input() incrementalHarvestingAllowed = false;
  @Input() customXsltAllowed = false;

  @Output() setLinkCheck: EventEmitter<number> = new EventEmitter();
  @ViewChild('pluginElement') pluginElement: ElementRef;

  EnumProtocolType = ProtocolType;

  /** ctrlSetLinkCheck
  /* emit link check event
  */
  ctrlSetLinkCheck(index: number): void {
    this.setLinkCheck.emit(index);
  }

  /** scrollToInput
  /* calls scrollIntoView event of native element
  */
  scrollToInput(): void {
    this.pluginElement.nativeElement.scrollIntoView(false);
  }

  /** isInactive
  /* returns whether field is inactive
  */
  isInactive(): boolean {
    if (this.conf.name === 'pluginLINK_CHECKING') {
      return false;
    }
    return !(this.workflowForm.get(this.conf.name) as UntypedFormControl).value;
  }
}
