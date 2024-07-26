import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalConfirmComponent } from 'shared';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  standalone: true,
  imports: [ModalConfirmComponent]
})
export class ModalFormComponent {
  @Input() modalId: string;
  @Input() formGroup: FormGroup;
  @Input() title = 'Depublish';
}
