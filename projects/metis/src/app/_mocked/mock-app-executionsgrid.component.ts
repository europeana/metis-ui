import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-executionsgrid',
  template: ''
})
export class MockExecutionsGridComponent {
  @Output() selectedSet = new EventEmitter<string>();
}
