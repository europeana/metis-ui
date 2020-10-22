import { async, TestBed } from '@angular/core/testing';

import { getCodeMirrorEditors } from '../_helpers/test-helpers';

import { EditorPrefService } from '.';

describe('editor pref service', () => {
  let service: EditorPrefService;
  let altTheme = '';

  beforeEach(async(() => {
    localStorage.removeItem('editor-pref');
    TestBed.configureTestingModule({
      providers: [EditorPrefService]
    }).compileComponents();
    service = TestBed.inject(EditorPrefService);
    altTheme = service.altTheme;
  }));

  afterEach(() => {
    localStorage.removeItem('editor-pref');
  });

  it('should use the default theme by default', () => {
    const theme = service.getEditorPref();
    expect(theme).toEqual('default');
  });

  it('should report on whether the current theme is the default theme', () => {
    expect(service.currentThemeIsDefault()).toEqual(true);
    service.toggleTheme(getCodeMirrorEditors());
    expect(service.currentThemeIsDefault()).toEqual(false);
  });

  it('can toggle the current theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editors: any = getCodeMirrorEditors();
    service.toggleTheme(editors);
    expect(service.getEditorPref()).not.toEqual('default');
    expect(editors[0].codeMirror.setOption).toHaveBeenCalledWith('theme', altTheme);
  });

  it('indicates if the toggled theme is the default theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    expect(service.toggleTheme(getCodeMirrorEditors())).not.toEqual('default');
    expect(service.toggleTheme(getCodeMirrorEditors())).toEqual('default');
  });

  it('provides an editor configuration object (read only)', () => {
    expect(service.getEditorConfig(true).readOnly).toEqual(true);
    expect(service.getEditorConfig(false).readOnly).toEqual(false);
  });
});
