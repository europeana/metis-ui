import { Injectable, QueryList } from '@angular/core';
import { CodemirrorComponent } from 'ng2-codemirror';

@Injectable({ providedIn: 'root' })
export class EditorPrefService {
  getEditorPref(): string {
    let res = localStorage.getItem('editor-pref');
    res = res ? res : 'default';

    console.error('getEditorPref returns ' + res);
    return res;
  }

  setEditorPref(theme: string): void {
    localStorage.setItem('editor-pref', theme);
  }

  toggleTheme(editors: QueryList<CodemirrorComponent>): void {
    const currTheme: string = this.getEditorPref();
    const newTheme: string = currTheme === 'default' ? 'isotope' : 'default';

    editors.forEach((cc) => {
      cc.instance.setOption('theme', newTheme);
    });

    this.setEditorPref(newTheme);
  }

  getEditorConfig(readOnly: boolean) {
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
