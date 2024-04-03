import { Injectable } from '@angular/core';
import { EditorConfiguration } from 'codemirror';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  altTheme: string;
  baseConf: EditorConfiguration = {
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
  editorConfig: BehaviorSubject<EditorConfiguration>;

  constructor() {
    this.altTheme = 'midnight';
    this.editorConfig = new BehaviorSubject<EditorConfiguration>(this.baseConf);
  }

  /** getEditorPref
  /*
  /* returns the locally-stored editor preference or the default
  */
  getEditorPref(): string {
    return localStorage.getItem('editor-pref') ?? 'default';
  }

  /** setEditorPref
   *
   * locally-stores the specified editor preference
   * updates the editorConfig subect
   * @param { string } theme - the theme to store
   **/
  setEditorPref(theme: string): void {
    localStorage.setItem('editor-pref', theme);
    this.editorConfig.next(
      Object.assign(this.baseConf, {
        theme: theme
      })
    );
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
}
