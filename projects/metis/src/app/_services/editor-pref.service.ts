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

  /** getEditorPref
  /*
  /* returns the locally-stored editor preference or the default
  */
  getEditorPref(): string {
    return localStorage.getItem('editor-pref') || 'default';
  }

  /** setEditorPref
   *
   * locally-stores the specified editor preference
   * updates the local editorConfig variable
   * @param { string } theme - the theme to store
   **/
  setEditorPref(theme: string): void {
    this.editorConfig.theme = theme;
    localStorage.setItem('editor-pref', theme);
  }

  /** currentThemeIsDefault
   *
   * return true if the locally-stored editor preference is the default
   **/
  currentThemeIsDefault(): boolean {
    return this.getEditorPref() === 'default';
  }

  /** toggleTheme
   *
   * toggles the locally-stored editor preference between the default and the alternative theme
   **/
  toggleTheme(): string {
    const currTheme = this.getEditorPref();
    const newTheme = currTheme === 'default' ? this.altTheme : 'default';
    this.setEditorPref(newTheme);
    return newTheme;
  }

  /** getEditorConfig
   *
   * returns a configuration for the CodeMirror editor
   **/
  getEditorConfig(): EditorConfiguration {
    return this.editorConfig;
  }
}
