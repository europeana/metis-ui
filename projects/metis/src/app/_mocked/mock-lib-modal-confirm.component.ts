import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-modal',
  template: ''
})
export class MockModalConfirmComponent {
  @Input() buttonClass: string;
  @Input() modalConfirmId: string;
  @Input() title: string;
}
