import { Component, provideZonelessChangeDetection, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextCopyDirective } from '.';

@Component({
  template: `
    <div class="cmp" appTextCopy #textCopy="textCopy"></div>
  `,
  imports: [TextCopyDirective]
})
class TestTextCopyDirectiveComponent {
  @ViewChild('textCopy') textCopy: TextCopyDirective;
}
describe('TextCopyDirective', () => {
  let fixture: ComponentFixture<TestTextCopyDirectiveComponent>;
  let component: TestTextCopyDirectiveComponent;

  beforeEach(() => {
    if (!navigator.clipboard) {
      (navigator as any).clipboard = {
        writeText: () => Promise.resolve()
      };
    }
    TestBed.configureTestingModule({
      imports: [TextCopyDirective, TestTextCopyDirectiveComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(TestTextCopyDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    const copyInfo = component.textCopy;
    expect(copyInfo).toBeTruthy();
  });

  it('should copy', () => {
    const value = 'my value';
    const clipboard = navigator.clipboard;
    vi.spyOn(clipboard, 'writeText');
    const copyInfo = component.textCopy;
    copyInfo.copy();
    expect(copyInfo.copied).toBeFalsy();
    copyInfo.copy(value);
    expect(copyInfo.copied).toBeTruthy();
    expect(clipboard.writeText).toHaveBeenCalledWith(value);
  });

  it('should reset', async () => {
    vi.useFakeTimers();
    const clipboard = navigator.clipboard;
    vi.spyOn(clipboard, 'writeText');
    const copyInfo = component.textCopy;
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
    expect(clipboard.writeText).toHaveBeenCalled();
    vi.advanceTimersByTime(copyInfo.timeToReset);
    fixture.detectChanges();
    expect(copyInfo.copied).toBeFalsy();
  });
});
