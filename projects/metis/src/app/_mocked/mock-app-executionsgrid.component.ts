import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-executionsgrid',
  standalone: true
})
export class MockExecutionsGridComponent {
  @Output() selectedSet = new EventEmitter<string>();
}
