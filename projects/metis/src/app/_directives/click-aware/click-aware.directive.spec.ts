import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickService } from '../../_services';
import { ClickAwareDirective } from '.';

@Component({
  template: `
    <div class="cmp">
      <div class="dead-zone">
        <br />
        <br />
        <br />
      </div>
      <div class="live-zone" appClickAware #clickInfo="clickInfo" (click)="clicked()">
        <span class="inner-element">CHILD</span>
      </div>
    </div>
  `,
  styles: ['.collapsed{ background-color: red; }']
})
class TestClickAwareDirectiveComponent {
  @ViewChild('clickInfo') clickInfo: ClickAwareDirective;
  hasBeenClicked = false;
  clicked(): void {
    this.hasBeenClicked = true;
  }
}

describe('ClickAwareDirective', () => {
  let fixture: ComponentFixture<TestClickAwareDirectiveComponent>;
  let component: TestClickAwareDirectiveComponent;
  let deadElement: DebugElement;
  let liveElement: DebugElement;
  let innerElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClickAwareDirective, TestClickAwareDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestClickAwareDirectiveComponent);
    deadElement = fixture.debugElement.query(By.css('.dead-zone'));
    liveElement = fixture.debugElement.query(By.css('.live-zone'));
    innerElement = fixture.debugElement.query(By.css('.inner-element'));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const clickInfo = component.clickInfo;
    expect(clickInfo).toBeTruthy();
  });

  it('should call the "documentClickListener" method when clicked', () => {
    const onClickMock = spyOn(component, 'clicked').and.callThrough();
    fixture.debugElement.query(By.css('.dead-zone')).triggerEventHandler('click', null);

    deadElement.nativeElement.click();
    expect(onClickMock).not.toHaveBeenCalled();

    liveElement.nativeElement.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should detect clicks in the element', () => {
    const clickInfo = component.clickInfo;

    expect(clickInfo.isClickedInside).toBeFalsy();

    clickInfo.documentClickListener(liveElement.nativeElement, deadElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeFalsy();

    clickInfo.documentClickListener(liveElement.nativeElement, innerElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeTruthy();
  });

  it('should detect clicks in the element via the service', () => {
    const clickInfo = component.clickInfo;
    const cmpClickService = fixture.debugElement.injector.get<ClickService>(ClickService);

    expect(clickInfo.isClickedInside).toBeFalsy();

    cmpClickService.documentClickedTarget.next(deadElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeFalsy();

    cmpClickService.documentClickedTarget.next(innerElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeTruthy();
  });
});
