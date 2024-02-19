/** SearchComponent
/*  an input and submit button that emits events on click and Enter
*/
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslatePipe } from '../../_translate/translate.pipe';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, NgTemplateOutlet, FormsModule, TranslatePipe]
})
export class SearchComponent {
  @Input() reversed = false;
  @Input() label?: string;
  @Input() loading = false;
  @Input() pattern?: string;
  @Input() inputId = 'search';
  @Input() searchString?: string;
  @Input() placeholderKey: string;
  @Input() executeEmpty = false;
  @Output() onExecute: EventEmitter<string> = new EventEmitter();
  @ViewChild('searchInput') searchInput: ElementRef;

  /** submitOnEnter
  /*  key down handler to call executeSearch
  /* @param {KeyboardEvent} e - the key event
  */
  submitOnEnter(e: KeyboardEvent): void {
    if (this.searchInput.nativeElement.validity.valid) {
      if (e.key === 'Enter') {
        this.executeSearch();
      }
    }
  }

  /** executeSearch
  /*  emits event with searchString
  */
  executeSearch(): void {
    this.searchInput.nativeElement.focus();
    if (this.searchString || this.executeEmpty) {
      this.onExecute.emit(this.searchString ? this.searchString.trim() : '');
    }
  }
}
