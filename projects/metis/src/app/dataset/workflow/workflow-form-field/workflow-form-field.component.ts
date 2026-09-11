import { NgClass } from '@angular/common';
import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
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
    WorkflowFormFieldMediaProcessComponent,
    WorkflowFormFieldLinkCheckComponent,
    WorkflowFormFieldTransformComponent,
    RenameWorkflowPipe,
    ProtocolFieldSetComponent
  ]
})
export class WorkflowFormFieldComponent {
  conf = input.required<WorkflowFieldData>();
  index = input.required<number>();
  workflowForm = input.required<UntypedFormGroup>();
  incrementalHarvestingAllowed = input<boolean>(false);
  customXsltAllowed = input<boolean>(false);

  setLinkCheck = output<number>();

  pluginElement = viewChild<ElementRef<HTMLAnchorElement>>('pluginElement');

  EnumProtocolType = ProtocolType;

  /**
   * isInactive
   * Computed signal evaluating whether the field is inactive.
   * This removes the method call from the template performance loop.
   */
  isInactive = computed(() => {
    const config = this.conf();
    const form = this.workflowForm();

    if (config.name === 'pluginLINK_CHECKING') {
      return false;
    }

    const control = form.get(config.name) as UntypedFormControl;
    return !control?.value;
  });

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
    this.pluginElement()?.nativeElement.scrollIntoView(false);
  }
}
