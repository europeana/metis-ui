import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-modal',
  standalone: true
})
export class MockModalConfirmComponent {
  @Input() buttonClass: string;
  @Input() modalConfirmId: string;
  @Input() title: string;
}
