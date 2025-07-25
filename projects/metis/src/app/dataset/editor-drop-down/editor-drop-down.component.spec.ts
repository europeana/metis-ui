import { ComponentFixture, TestBed } from '@angular/core/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';

import { EditorDropDownComponent } from '.';

describe('EditorDropDownComponent', () => {
  let component: EditorDropDownComponent;
  let fixture: ComponentFixture<EditorDropDownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
    fixture.detectChanges();
  });

  // check component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide', () => {
    component.showing = true;
    expect(component.showing).toBeTruthy();
    component.hide();
    expect(component.showing).toBeFalsy();
  });

  it('should toggle', () => {
    expect(component.showing).toBeFalsy();
    component.toggle();
    expect(component.showing).toBeTruthy();
    component.toggle();
    expect(component.showing).toBeFalsy();
  });

  it('should hide when the theme is set', () => {
    component.showing = true;
    expect(component.showing).toBeTruthy();
    component.setTheme(false);
    expect(component.showing).toBeFalsy();
  });
});
