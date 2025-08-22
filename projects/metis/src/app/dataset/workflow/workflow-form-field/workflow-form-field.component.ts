import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';
import { ProtocolFieldSetComponent, ProtocolType } from 'shared';
import { WorkflowFieldData } from '../../../_models';
import { RenameWorkflowPipe } from '../../../_translate';
import { WorkflowFormFieldTransformComponent } from '../workflow-form-field-transform';
import { WorkflowFormFieldLinkCheckComponent } from '../workflow-form-field-link-check';
import { WorkflowFormFieldMediaProcessComponent } from '../workflow-form-field-media-process';

@Component({
  selector: 'app-workflow-form-field',
  templateUrl: './workflow-form-field.component.html',
  styleUrls: ['./workflow-form-field.component.scss'],
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
