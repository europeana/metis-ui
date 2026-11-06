import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';

import { EditorDropDownComponent } from '.';

describe('EditorDropDownComponent', () => {
  let component: EditorDropDownComponent;
  let fixture: ComponentFixture<EditorDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorDropDownComponent],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorDropDownComponent);
    component = fixture.componentInstance;

    // Provide a baseline value for the required signal input before layout execution
    fixture.componentRef.setInput('editorIsDefaultTheme', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should hide', () => {
    component.showing.set(true);
    expect(component.showing()).toBeTruthy();

    component.hide();
    TestBed.flushEffects();

    expect(component.showing()).toBe(false);
  });

  it('should toggle', () => {
    expect(component.showing()).toBe(false);

    component.toggle();
    TestBed.flushEffects();
    expect(component.showing()).toBeTruthy();

    component.toggle();
    TestBed.flushEffects();
    expect(component.showing()).toBe(false);
  });

  it('should hide when the theme is set', () => {
    vi.spyOn(component.themeSet, 'emit');
    component.showing.set(true);
    expect(component.showing()).toBeTruthy();

    component.setTheme(false);
    TestBed.flushEffects();

    expect(component.showing()).toBe(false);
    expect(component.themeSet.emit).toHaveBeenCalledWith(false);
  });
});
