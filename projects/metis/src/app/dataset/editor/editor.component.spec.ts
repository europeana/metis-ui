import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';

import { ClassMap, createMockPipe } from 'shared';
import { MockCodemirrorComponent, MockTranslateService } from '../../_mocked';
import { XmlDownload } from '../../_models';
import { EditorPrefService } from '../../_services';
import { TranslatePipe, TranslateService } from '../../_translate';
import { EditorComponent } from '.';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let editorPrefs: EditorPrefService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [EditorComponent, NgClass],
      providers: [
        { provide: EditorPrefService, useClass: EditorPrefService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideModule(CodemirrorModule, {
        remove: { declarations: [CodemirrorComponent], exports: [CodemirrorComponent] },
        add: { declarations: [MockCodemirrorComponent], exports: [MockCodemirrorComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    editorPrefs = TestBed.inject(EditorPrefService);

    fixture.componentRef.setInput('title', 'Initial Test Title');
    fixture.detectChanges();
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the readOnly flag in the editorConfig', () => {
    expect(component.editorConfig()?.readOnly).toBeTruthy();

    fixture.componentRef.setInput('isReadOnly', false);
    fixture.detectChanges();

    editorPrefs.editorConfig.subscribe((config) => {
      if (config) {
        config.readOnly = component.isReadOnly();
        component.editorConfig.set({ ...config });
      }
    });
    fixture.detectChanges();

    expect(component.editorConfig()?.readOnly).toBeFalsy();
  });

  it('should allow extra classes', () => {
    const testClass = 'myClass';
    const extraClasses = {} as ClassMap;
    extraClasses[testClass] = true;

    expect(component.mergedClasses()[testClass]).toBeFalsy();

    fixture.componentRef.setInput('extraClasses', extraClasses);
    fixture.detectChanges();

    expect(component.mergedClasses()[testClass]).toBeTruthy();
  });

  it('should have xmlDownloads', () => {
    const mappedDownloads = [null, {}].map((item: unknown) => item as XmlDownload);

    fixture.componentRef.setInput('xmlDownloads', mappedDownloads);
    fixture.detectChanges();

    expect(component.filteredXmlDownloads()).toBeTruthy();
    expect(component.filteredXmlDownloads()?.length).toEqual(1);

    fixture.componentRef.setInput('xmlDownloads', undefined);
    fixture.detectChanges();

    expect(component.filteredXmlDownloads()).toBeFalsy();
  });

  it('should toggle', () => {
    spyOn(component.toggled, 'emit');
    fixture.componentRef.setInput('index', 123);
    fixture.detectChanges();

    component.toggle();
    expect(component.toggled.emit).toHaveBeenCalledWith(123);
  });

  it('should set the theme', () => {
    spyOn(editorPrefs, 'toggleTheme');
    component.onThemeSet();
    expect(editorPrefs.toggleTheme).toHaveBeenCalled();
  });

  it('should search', () => {
    spyOn(component.searched, 'emit');
    component.search('abc');
    expect(component.searched.emit).toHaveBeenCalledWith('abc');

    component.search('');
    expect(component.searched.emit).toHaveBeenCalledTimes(2);
  });
});
