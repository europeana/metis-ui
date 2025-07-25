/** Component for linking a modal dialog ref (ModalConfirmComponent) to a FormGroup
 * - reuses (decorates) the <lib-modal> content projection
 */
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalConfirmComponent } from 'shared';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  imports: [ModalConfirmComponent]
})
export class ModalFormComponent {
  @Input() modalId: string;
  @Input() title = 'Depublish';
  @Input() formGroup: FormGroup;
  @Input() wide = false;
  @Input() yesNo = true;
  @Input() labelSubmit = 'yes';
}
