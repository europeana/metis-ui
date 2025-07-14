import { TestBed } from '@angular/core/testing';
import { EditorPrefService } from '.';

describe('editor pref service', () => {
  let service: EditorPrefService;
  let altTheme = '';

  beforeEach(() => {
    localStorage.removeItem('editor-pref');
    TestBed.configureTestingModule({
      providers: [EditorPrefService]
    }).compileComponents();
    service = TestBed.inject(EditorPrefService);
    altTheme = service.altTheme;
  });

  afterEach(() => {
    localStorage.removeItem('editor-pref');
  });

  it('should use the default theme by default', () => {
    const theme = service.getEditorPref();
    expect(theme).toEqual('default');
  });

  it('should report on whether the current theme is the default theme', () => {
    expect(service.currentThemeIsDefault()).toEqual(true);
    service.toggleTheme();
    expect(service.currentThemeIsDefault()).toEqual(false);
  });

  it('can toggle the current theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    service.toggleTheme();
    expect(service.getEditorPref()).not.toEqual('default');
    expect(service.getEditorPref()).toEqual(altTheme);
  });

  it('indicates if the toggled theme is the default theme', () => {
    expect(service.getEditorPref()).toEqual('default');
    expect(service.toggleTheme()).not.toEqual('default');
    expect(service.toggleTheme()).toEqual('default');
  });
});
