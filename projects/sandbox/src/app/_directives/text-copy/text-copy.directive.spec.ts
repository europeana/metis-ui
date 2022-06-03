import { Component, DebugElement } from '@angular/core';
import { ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TextCopyDirective } from '.';

@Component({
  template: `
    <div class="cmp" appTextCopy #textCopy="textCopy"></div>
  `
})
class TestTextCopyDirectiveComponent {
  @ViewChild('textCopy') textCopy: TextCopyDirective;
}
describe('TextCopyDirective', () => {
  let fixture: ComponentFixture<TestTextCopyDirectiveComponent>;
  let component: TestTextCopyDirectiveComponent;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextCopyDirective, TestTextCopyDirectiveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTextCopyDirectiveComponent);
    debugElement = fixture.debugElement.query(By.css('.cmp'));
    component = fixture.componentInstance;
    fixture.detectChanges();
    console.log(debugElement);
  });

  it('should create', () => {
    const copyInfo = component.textCopy;
    expect(copyInfo).toBeTruthy();
  });

  it('should copy', () => {
    const copyInfo = component.textCopy;
    copyInfo.copy();
    expect(copyInfo.copied).toBeFalsy();
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
  });

  it('should reset', fakeAsync(() => {
    const copyInfo = component.textCopy;
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
    tick(copyInfo.timeToReset);
    expect(copyInfo.copied).toBeFalsy();
  }));
});
