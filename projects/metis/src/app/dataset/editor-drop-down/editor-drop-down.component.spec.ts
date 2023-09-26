import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe } from '../../_mocked';

import { EditorDropDownComponent } from '.';

describe('EditorDropDownComponent', () => {
  let component: EditorDropDownComponent;
  let fixture: ComponentFixture<EditorDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorDropDownComponent, createMockPipe('translate')]
    }).compileComponents();
  }));

  beforeEach(() => {
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
