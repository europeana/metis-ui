import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-modal',
  template: ''
})
class MockModalConfirmComponent {
  @Input() id: string;
  @Input() title: string;
  @Input() isSmall: boolean;
  @Input() buttons: any[];
}
