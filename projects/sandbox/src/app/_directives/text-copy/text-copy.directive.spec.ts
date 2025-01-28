import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TextCopyDirective } from '.';

@Component({
  template: `
    <div class="cmp" appTextCopy #textCopy="textCopy"></div>
  `,
  standalone: true,
  imports: [TextCopyDirective]
})
class TestTextCopyDirectiveComponent {
  @ViewChild('textCopy') textCopy: TextCopyDirective;
}
describe('TextCopyDirective', () => {
  let fixture: ComponentFixture<TestTextCopyDirectiveComponent>;
  let component: TestTextCopyDirectiveComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextCopyDirective, TestTextCopyDirectiveComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestTextCopyDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const copyInfo = component.textCopy;
    expect(copyInfo).toBeTruthy();
  });

  it('should copy', () => {
    const value = 'my value';
    const clipboard = navigator.clipboard;
    spyOn(clipboard, 'writeText');
    const copyInfo = component.textCopy;
    copyInfo.copy();
    expect(copyInfo.copied).toBeFalsy();
    copyInfo.copy(value);
    expect(copyInfo.copied).toBeTruthy();
    expect(clipboard.writeText).toHaveBeenCalledWith(value);
  });

  it('should reset', fakeAsync(() => {
    const clipboard = navigator.clipboard;
    spyOn(clipboard, 'writeText');
    const copyInfo = component.textCopy;
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
    expect(clipboard.writeText).toHaveBeenCalled();
    tick(copyInfo.timeToReset);
    expect(copyInfo.copied).toBeFalsy();
  }));
});
