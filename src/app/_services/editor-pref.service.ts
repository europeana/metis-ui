import { Injectable, QueryList } from '@angular/core';
import { EditorConfiguration } from 'codemirror';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  altTheme: string;

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
  /*
  /* locally-stores the specified editor preference
  */
  setEditorPref(theme: string): void {
    localStorage.setItem('editor-pref', theme);
  }

  /** currentThemeIsDefault
  /*
  /* return true if the locally-stored editor preference is the default
  */
  currentThemeIsDefault(): boolean {
    return this.getEditorPref() === 'default';
  }

  /** toggleTheme
  /*
  /* toggles the locally-stored editor preference between the default and the alternative theme
  */
  toggleTheme(editors: QueryList<CodemirrorComponent>): string {
    const currTheme = this.getEditorPref();
    const newTheme = currTheme === 'default' ? this.altTheme : 'default';

    editors.forEach((cc) => {
      if (cc.codeMirror) {
        cc.codeMirror.setOption('theme', newTheme);
      }
    });

    this.setEditorPref(newTheme);
    return newTheme;
  }

  /** getEditorConfig
  /*
  /* returns a configuration for the CodeMirror editor
  */
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
