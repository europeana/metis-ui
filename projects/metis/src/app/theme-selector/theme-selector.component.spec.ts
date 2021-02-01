import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe } from '../_mocked';

import { ThemeSelectorComponent } from '.';

describe('ThemeSelectorComponent', () => {
  let component: ThemeSelectorComponent;
  let fixture: ComponentFixture<ThemeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThemeSelectorComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // check component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // check component hides
  it('should hide', () => {
    component.showing = true;
    expect(component.showing).toBeTruthy();
    component.hide();
    expect(component.showing).toBeFalsy();
  });

  // check component shows
  it('should show', () => {
    expect(component.showing).toBeFalsy();
    component.show();
    expect(component.showing).toBeTruthy();
  });

  // check component hides when the theme is set
  it('should hide when the theme is set', () => {
    component.showing = true;
    expect(component.showing).toBeTruthy();
    component.setTheme(false);
    expect(component.showing).toBeFalsy();
  });
});
