import { Component, input, TemplateRef } from '@angular/core';
import { ModalDialogButtonDefinition } from 'shared';

@Component({
  selector: 'lib-modal',
  template: ''
})
export class MockModalConfirmComponent {
  id = input.required<string>();
  title = input<string>('');
  buttonClass = input<string>('');
  buttonText = input<string>();
  buttons = input<Array<ModalDialogButtonDefinition>>();
  isSmall = input<boolean>(true);
  permanent = input<boolean>(false);
  templateHeadContent = input<TemplateRef<HTMLElement>>();
}
