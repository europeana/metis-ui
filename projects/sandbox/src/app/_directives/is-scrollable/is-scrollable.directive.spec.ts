import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IsScrollableDirective } from '.';

@Component({
  imports: [IsScrollableDirective],
  template: `
    <div class="cmp">
      <div class="scrollable" appIsScrollable #scrollInfo="scrollInfo" id="scrollInfo"></div>
      <a class="back" (click)="scrollInfo.back()">BACK</a>
      <a class="fwd" (click)="scrollInfo.fwd()">FWD</a>
    </div>
  `,
  styles: ['.scrollable{ width: 100px; max-width: 100px; }'],
  standalone: true
})
class TestIsScrollableDirectiveComponent {}

describe('IsScrollableDirective', () => {
  let fixture: ComponentFixture<TestIsScrollableDirectiveComponent>;
  let testComponent: TestIsScrollableDirectiveComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IsScrollableDirective, TestIsScrollableDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestIsScrollableDirectiveComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('it should create', () => {
    expect(testComponent).toBeTruthy();
  });
});
