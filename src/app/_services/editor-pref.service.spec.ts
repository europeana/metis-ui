import { QueryList } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { CodemirrorComponent } from 'ng2-codemirror';

import { EditorPrefService } from '.';

function makeQueryList(): QueryList<CodemirrorComponent> {
  // tslint:disable: no-any
  return ([
    {
      instance: {
        setOption(name: string, value: string): void {
          console.log('set ' + name + ' to ' + value);
        },
      },
    },
  ] as any) as QueryList<CodemirrorComponent>;
}

describe('editor pref service', () => {
  let service: EditorPrefService;

  beforeEach(async(() => {
    localStorage.removeItem('editor-pref');
    TestBed.configureTestingModule({
      providers: [EditorPrefService],
    }).compileComponents();
    service = TestBed.get(EditorPrefService);
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
    service.toggleTheme(makeQueryList());
    expect(service.currentThemeIsDefault()).toEqual(false);
  });

  it('can toggle the current theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    service.toggleTheme(makeQueryList());
    expect(service.getEditorPref()).not.toEqual('default');
  });

  it('indicates if the toggled theme is the default theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    expect(service.toggleTheme(makeQueryList())).toEqual(false);
    expect(service.toggleTheme(makeQueryList())).toEqual(true);
  });

  it('provides an editor configuration object (read only)', () => {
    expect(service.getEditorConfig(true).readOnly).toEqual(true);
    expect(service.getEditorConfig(false).readOnly).toEqual(false);
  });
});
