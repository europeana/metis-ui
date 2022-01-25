import { Component, DebugElement } from '@angular/core';
import { ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HrefCopyDirective } from '.';

@Component({
  template: `
    <div class="cmp" appHrefCopy #hrefCopy="hrefCopy"></div>
  `
})
class TestHrefCopyDirectiveComponent {
  @ViewChild('hrefCopy') hrefCopy: HrefCopyDirective;
}
describe('HrefCopyDirective', () => {
  let fixture: ComponentFixture<TestHrefCopyDirectiveComponent>;
  let component: TestHrefCopyDirectiveComponent;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HrefCopyDirective, TestHrefCopyDirectiveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHrefCopyDirectiveComponent);
    debugElement = fixture.debugElement.query(By.css('.cmp'));
    component = fixture.componentInstance;
    fixture.detectChanges();
    console.log(debugElement);
  });

  it('should create', () => {
    const copyInfo = component.hrefCopy;
    expect(copyInfo).toBeTruthy();
  });

  it('should copy', () => {
    const copyInfo = component.hrefCopy;
    copyInfo.copy();
    expect(copyInfo.copied).toBeFalsy();
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
  });

  it('should reset', fakeAsync(() => {
    const copyInfo = component.hrefCopy;
    copyInfo.copy('text');
    expect(copyInfo.copied).toBeTruthy();
    tick(copyInfo.timeToReset);
    expect(copyInfo.copied).toBeFalsy();
  }));
});
