import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent {
  showing: boolean;
  @Output() themeSet = new EventEmitter<boolean>();
  @Input() editorIsDefaultTheme: boolean;
  setTheme(defaultTheme: boolean): void {
    this.themeSet.emit(defaultTheme);
    this.showing = false;
  }

  /** hide
  /* set the showing variable to false
  */
  hide(): void {
    this.showing = false;
  }

  /** show
  /* set the showing variable to true
  */
  show(): void {
    this.showing = true;
  }
}
