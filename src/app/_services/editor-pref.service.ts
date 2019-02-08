import { Injectable, QueryList } from '@angular/core';
import { EditorConfiguration } from 'codemirror';
import { CodemirrorComponent } from 'ng2-codemirror';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  getEditorPref(): string {
    let res = localStorage.getItem('editor-pref');
    res = res ? res : 'default';
    return res;
  }

  setEditorPref(theme: string): void {
    localStorage.setItem('editor-pref', theme);
  }

  currentThemeIsDefault(): boolean {
    return this.getEditorPref() === 'default';
  }

  toggleTheme(editors: QueryList<CodemirrorComponent>): boolean {
    const currTheme: string = this.getEditorPref();
    const newTheme: string = currTheme === 'default' ? 'isotope' : 'default';

    editors.forEach((cc) => {
      cc.instance.setOption('theme', newTheme);
    });

    this.setEditorPref(newTheme);
    return this.currentThemeIsDefault();
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
      theme: this.getEditorPref(),
    };
  }
}
