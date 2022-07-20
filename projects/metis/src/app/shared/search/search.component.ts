/** SearchComponent
/*  an input and submit button that emits events on click and Enter
*/
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() searchString?: string;
  @Input() placeholderKey: string;
  @Output() onExecute: EventEmitter<string> = new EventEmitter();

  /** submitOnEnter
  /*  key down handler to call executeSearch
  /* @param {KeyboardEvent} e - the key event
  */
  submitOnEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.executeSearch();
    }
  }

  /** executeSearch
  /*  emits event with searchString
  */
  executeSearch(): void {
    if (this.searchString) {
      this.onExecute.emit(this.searchString.trim());
    }
  }
}
