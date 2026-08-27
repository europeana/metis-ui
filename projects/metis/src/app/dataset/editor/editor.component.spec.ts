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

    // Provide a required default string for the title model input definition
    fixture.componentRef.setInput('title', 'Initial Test Title');
    fixture.detectChanges();
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the readOnly flag in the editorConfig', () => {
    component.ngOnInit();
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

    expect(component.extraClasses()[testClass]).toBeFalsy();

    fixture.componentRef.setInput('extraClasses', extraClasses);
    fixture.detectChanges();
    expect(component.extraClasses()[testClass]).toBeTruthy();
  });

  it('should have xmlDownloads', () => {
    const mappedDownloads = [null, {}].map((item: unknown) => item as XmlDownload);

    fixture.componentRef.setInput('xmlDownloads', mappedDownloads);
    fixture.detectChanges();

    expect(component.xmlDownloads()).toBeTruthy();
    expect(component.xmlDownloads()?.length).toEqual(1);

    fixture.componentRef.setInput('xmlDownloads', undefined);
    fixture.detectChanges();
    expect(component.xmlDownloads()).toBeFalsy();
  });

  it('should toggle', () => {
    spyOn(component.onToggle, 'emit');
    fixture.componentRef.setInput('index', 123);
    fixture.detectChanges();

    component.toggle();
    expect(component.onToggle.emit).toHaveBeenCalledWith(123);
  });

  it('should set the theme', () => {
    spyOn(editorPrefs, 'toggleTheme');
    component.onThemeSet();
    expect(editorPrefs.toggleTheme).toHaveBeenCalled();
  });

  it('should search', () => {
    spyOn(component.onSearch, 'emit');
    component.search('abc');
    expect(component.onSearch.emit).toHaveBeenCalledWith('abc');

    component.search('');
    expect(component.onSearch.emit).toHaveBeenCalledTimes(2);
  });
});
