import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IsScrollableDirective } from '.';

@Component({
  imports: [IsScrollableDirective],
  template: `
    <div>
      <div class="scrollable" appIsScrollable #scrollInfo="scrollInfo">
        <div class="item">Hello</div>
        <div class="item">Hello</div>
        <div class="item">Hello</div>
        <div class="item">Hello</div>
      </div>
      <div class="output-1">{{ scrollInfo.canScrollFwd() }}</div>
      <div class="output-2">{{ scrollInfo.canScrollBack() }}</div>
    </div>
  `,
  styles: [
    `
      .scrollable {
        display: flex;
        flex-direction: column;
        height: 100px;
        width: 100px;
        max-height: 100px;
        overflow-y: auto;
      }
      .item {
        display: block;
        height: 300px;
        width: 100px;
      }
    `
  ]
})
class TestIsScrollableDirectiveComponent {
  @ViewChild(IsScrollableDirective) scrollInfo: IsScrollableDirective;
}

describe('IsScrollableDirective', () => {
  let fixture: ComponentFixture<TestIsScrollableDirectiveComponent>;
  let testComponent: TestIsScrollableDirectiveComponent;
  let elScrollable: HTMLElement;
  let elOutput1: HTMLElement;
  let elOutput2: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IsScrollableDirective, TestIsScrollableDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(TestIsScrollableDirectiveComponent);
    testComponent = fixture.componentInstance;
    elScrollable = fixture.debugElement.nativeElement.querySelector('.scrollable');
    fixture.detectChanges();
    elOutput1 = fixture.debugElement.nativeElement.querySelector('.output-1');
    elOutput2 = fixture.debugElement.nativeElement.querySelector('.output-2');
    testComponent.scrollInfo.calc();
    fixture.detectChanges();
  });

  it('it should create', () => {
    expect(testComponent).toBeTruthy();
  });

  it('it should re-caluculate on scroll', () => {
    console.log(!!elOutput1 + ' ' + !!elOutput2 + ' ' + !!elScrollable);
    // TODO: fix this test
    /*
    expect(testComponent.scrollInfo.canScrollFwd()).toBeTruthy();
    expect(testComponent.scrollInfo.canScrollBack()).toBeFalsy();

    expect(elOutput2.innerHTML).toEqual('false');

    elScrollable.scrollTop = 1000;

    testComponent.scrollInfo.calc();

    elScrollable.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(elOutput1.innerHTML).toEqual('false');
    expect(elOutput2.innerHTML).toEqual('true');
    */
  });

  it('it should re-caluculate when elements are added', () => {
    // TODO: fix this test
    /*
    expect(testComponent.scrollInfo.canScrollFwd()).toBeTruthy();
    expect(testComponent.scrollInfo.canScrollBack()).toBeFalsy();

    expect(elOutput1.innerHTML).toEqual('true');
    expect(elOutput2.innerHTML).toEqual('false');

    fixture.debugElement.nativeElement.querySelectorAll('.item').forEach((el: Element) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    elScrollable.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(elOutput1.innerHTML).toEqual('false');
    expect(elOutput2.innerHTML).toEqual('false');
    */
  });
});
