import { NgClass } from '@angular/common';
import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ProtocolFieldSetComponent, ProtocolType } from 'shared';
import { WorkflowFieldData } from '../../../_models';
import { RenameWorkflowPipe } from '../../../_translate';
import { WorkflowFormFieldTransformComponent } from '../workflow-form-field-transform';
import { WorkflowFormFieldLinkCheckComponent } from '../workflow-form-field-link-check';
import { WorkflowFormFieldMediaProcessComponent } from '../workflow-form-field-media-process';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { merge, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

  // bridge reactive form status updates to signal template
  private formValue = toSignal(
    toObservable(this.workflowForm).pipe(
      switchMap((form) => {
        if (!form) {
          return of(false);
        }
        const ctrl = form.get(this.conf().name);
        if (!ctrl) {
          return of(false);
        }
        return merge(of(ctrl.value), ctrl.valueChanges).pipe(map(() => !!ctrl.value));
      })
    ),
    { initialValue: false }
  );

  isInactive = computed(() => {
    if (this.conf().name === 'pluginLINK_CHECKING') {
      return false;
    }
    return !this.formValue();
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
