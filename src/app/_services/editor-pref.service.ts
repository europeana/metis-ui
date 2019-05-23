import { Injectable, QueryList } from '@angular/core';
import { EditorConfiguration } from 'codemirror';
import { CodemirrorComponent } from 'ng2-codemirror';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  altTheme: string;

  constructor() {
    this.altTheme = 'midnight';
  }

  getEditorPref(): string {
    return localStorage.getItem('editor-pref') || 'default';
  }

  setEditorPref(theme: string): void {
    localStorage.setItem('editor-pref', theme);
  }

  currentThemeIsDefault(): boolean {
    return this.getEditorPref() === 'default';
  }

  toggleTheme(editors: QueryList<CodemirrorComponent>): string {
    const currTheme = this.getEditorPref();
    const newTheme = currTheme === 'default' ? this.altTheme : 'default';

    editors.forEach((cc) => {
      cc.instance.setOption('theme', newTheme);
    });

    this.setEditorPref(newTheme);
    return newTheme;
  }

  getEditorConfig(readOnly: boolean): EditorConfiguration {
    return {
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      readOnly,
      foldGutter: true,
      indentWithTabs: true,
      viewportMargin: Infinity,
      lineWrapping: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      theme: this.getEditorPref()
    };
  }
}
