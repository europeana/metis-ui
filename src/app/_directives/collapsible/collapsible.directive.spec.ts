import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CollapsibleDirective } from '.';

@Component({
  template: `
    <div class="cmp" appCollapsible>
      <span class="collapsible-trigger">trigger</span>
      <div class="cmp-inner" appCollapsible>
        <span class="collapsible-trigger">trigger</span>
      </div>
    </div>
  `,
  styles: ['.collapsed{ background-color: red; }']
})
class TestCollapsibleDirectiveComponent {}

describe('CollapsibleDirective', () => {
  let fixture: ComponentFixture<TestCollapsibleDirectiveComponent>;
  let buttonElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollapsibleDirective, TestCollapsibleDirectiveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCollapsibleDirectiveComponent);
    buttonElement = fixture.debugElement.query(By.css('.collapsible-trigger'));
  });

  it('is not collapsed by default', () => {
    expect(fixture.nativeElement.classList.contains('collapsed')).toBeFalsy();
  });

  it('remains collapsed when clicked', () => {
    const el = fixture.debugElement.query(By.css('.cmp'));
    expect(el.classes.collapsed).toBeFalsy();
    el.nativeElement.click();
    fixture.detectChanges();
    expect(el.classes.collapsed).toBeFalsy();
  });

  it('is collapsed when a trigger is clicked', () => {
    const el = fixture.debugElement.query(By.css('.cmp'));
    expect(el.classes.collapsed).toBeFalsy();
    buttonElement.nativeElement.click();
    fixture.detectChanges();
    expect(el.classes.collapsed).toBeTruthy();
  });

  it('toggles the collapse over multiple clicks', () => {
    const el = fixture.debugElement.query(By.css('.cmp'));
    expect(el.classes.collapsed).toBeFalsy();
    buttonElement.nativeElement.click();
    fixture.detectChanges();
    expect(el.classes.collapsed).toBeTruthy();
    buttonElement.nativeElement.click();
    fixture.detectChanges();
    expect(el.classes.collapsed).toBeFalsy();
  });

  it('prevents trigger events crossing nested directives', () => {
    const el = fixture.debugElement.query(By.css('.cmp'));
    const elInner = fixture.debugElement.query(By.css('.cmp-inner'));
    const buttonInner = fixture.debugElement.query(By.css('.cmp-inner .collapsible-trigger'));

    expect(el.classes.collapsed).toBeFalsy();
    expect(elInner.classes.collapsed).toBeFalsy();

    buttonInner.nativeElement.click();
    fixture.detectChanges();

    expect(el.classes.collapsed).toBeFalsy();
    expect(elInner.classes.collapsed).toBeTruthy();
  });
});
