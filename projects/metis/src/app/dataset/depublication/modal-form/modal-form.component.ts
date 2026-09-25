/** Component for linking a modal dialog ref (ModalConfirmComponent) to a FormGroup
 * - reuses (decorates) the <lib-modal> content projection
 */

import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalConfirmComponent } from 'shared';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  imports: [ModalConfirmComponent]
})
export class ModalFormComponent {
  readonly modalId = input.required<string>();
  readonly formGroup = input.required<FormGroup>();

  readonly title = input<string>('Depublish');
  readonly wide = input<boolean>(false);
  readonly yesNo = input<boolean>(true);
  readonly labelSubmit = input<string>('yes');
}
