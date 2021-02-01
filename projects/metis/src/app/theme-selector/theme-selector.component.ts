/** ThemeSelectorComponent
/*
/* a component for altering the theme of the CodeMirror XML editor
/* the theme can be the default or an alternative
/* the theme is set with a menu drop-down component
*/
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
