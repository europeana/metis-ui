import { QueryList } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';

/** getCodeMirrorEditors
/* export function for generating a representation of CodeMirror components
*/
export function getCodeMirrorEditors(): QueryList<CodemirrorComponent> {
  return ([
    {
      codeMirror: {
        setOption: jasmine.createSpy('setEditorOption')
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any) as QueryList<CodemirrorComponent>;
}
