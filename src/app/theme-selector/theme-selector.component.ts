import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
})
export class ThemeSelectorComponent {
  showing: boolean;
  @Output() themeSet = new EventEmitter<boolean>();
  @Input() editorIsDefaultTheme: boolean;
  setTheme(defaultTheme: boolean): void {
    this.themeSet.emit(defaultTheme);
  }
  hide(): void {
    this.showing = false;
  }
  show(): void {
    this.showing = true;
  }
}
