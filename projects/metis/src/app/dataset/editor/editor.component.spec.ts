import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';

import { createMockPipe } from '../../_mocked';
import { XmlDownload } from '../../_models';
import { EditorPrefService } from '../../_services';
import { EditorComponent } from '.';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let editorPrefs: EditorPrefService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [EditorComponent, createMockPipe('translate')],
      providers: [{ provide: EditorPrefService, useClass: EditorPrefService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    editorPrefs = TestBed.inject(EditorPrefService);
  };

  beforeEach(async(() => {
    configureTestbed();
  }));

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the readOnly flag in the editorConfig', () => {
    component.ngOnInit();
    expect(component.editorConfig.readOnly).toBeTruthy();

    component.isReadOnly = false;
    component.ngOnInit();
    expect(component.editorConfig.readOnly).toBeFalsy();
  });

  it('should allow extra classes', () => {
    const testClass = 'myClass';
    const extraClasses = {} as ClassMap;
    extraClasses[testClass] = true;

    expect(component.extraClasses[testClass]).toBeFalsy();
    component.extraClasses = extraClasses;
    fixture.detectChanges();
    expect(component.extraClasses[testClass]).toBeTruthy();
  });

  it('should have xmlDownloads', () => {
    component.xmlDownloads = [null, {}].map((item: unknown) => {
      return item as XmlDownload;
    });
    expect(component.xmlDownloads).toBeTruthy();
    if (component.xmlDownloads) {
      expect(component.xmlDownloads.length).toEqual(1);
    }
    component.xmlDownloads = undefined;
    expect(component.xmlDownloads).toBeFalsy();
  });

  it('should toggle', () => {
    spyOn(component.onToggle, 'emit');
    component.index = 123;
    component.toggle();
    expect(component.onToggle.emit).toHaveBeenCalledWith(component.index);
  });

  it('should set the theme', () => {
    spyOn(editorPrefs, 'toggleTheme');
    component.onThemeSet();
    expect(editorPrefs.toggleTheme).toHaveBeenCalled();
  });

  it('should search', () => {
    spyOn(component.onSearch, 'emit');
    component.search('abc');
    expect(component.onSearch.emit).toHaveBeenCalled();
    component.search('');
    expect(component.onSearch.emit).toHaveBeenCalledTimes(2);
  });
});
