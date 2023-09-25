import { Injectable } from '@angular/core';
import { EditorConfiguration } from 'codemirror';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  altTheme: string;
  editorConfig: EditorConfiguration = {
    mode: 'application/xml',
    lineNumbers: true,
    indentUnit: 2,
    readOnly: true,
    foldGutter: true,
    indentWithTabs: true,
    viewportMargin: Infinity,
    lineWrapping: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    theme: this.getEditorPref()
  };

  constructor() {
    this.altTheme = 'midnight';
  }

  getEditorPref(): string {
    return localStorage.getItem('editor-pref') || 'default';
  }

  setEditorPref(theme: string): void {
    this.editorConfig.theme = theme;
    localStorage.setItem('editor-pref', theme);
  }

  currentThemeIsDefault(): boolean {
    return this.getEditorPref() === 'default';
  }

  toggleTheme(): string {
    const currTheme = this.getEditorPref();
    const newTheme = currTheme === 'default' ? this.altTheme : 'default';
    this.setEditorPref(newTheme);
    return newTheme;
  }

  getEditorConfig(): EditorConfiguration {
    return this.editorConfig;
  }
}
