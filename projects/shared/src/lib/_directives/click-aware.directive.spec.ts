import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickService } from '../_services/click.service';
import { ClickAwareDirective } from './click-aware.directive';

@Component({
  imports: [ClickAwareDirective],
  template: `
    <div class="cmp">
      <div class="dead-zone">
        <br />
        <br />
        <span class="ignore-me">IGNORE</span>
        <br />
      </div>
      <div
        class="live-zone"
        libClickAware
        #clickInfo="clickInfo"
        (click)="click1()"
        (clickOutside)="clickOutside1()"
      >
        <span class="inner-element">CHILD</span>
      </div>
      <div
        class="ignore-when"
        libClickAware
        (click)="click2()"
        (clickOutside)="clickOutside2()"
        [clickAwareIgnoreWhen]="true"
      >
        <span class="inner-element">CHILD</span>
      </div>
      <div
        class="ignore-classes"
        libClickAware
        (click)="click3()"
        (clickOutside)="clickOutside3()"
        [ignoreClasses]="['ignore-me']"
      >
        <span class="inner-element">CHILD</span>
      </div>
    </div>
  `,
  styles: ['.collapsed{ background-color: red; }'],
  standalone: true
})
class TestClickAwareDirectiveComponent {
  @ViewChild('clickInfo') clickInfo: ClickAwareDirective;
  hasBeenClicked1 = false;
  hasBeenClickedOutside1 = false;
  hasBeenClicked2 = false;
  hasBeenClickedOutside2 = false;
  hasBeenClicked3 = false;
  hasBeenClickedOutside3 = false;
  click1(): void {
    this.hasBeenClicked1 = true;
  }
  clickOutside1(): void {
    this.hasBeenClickedOutside1 = true;
  }
  click2(): void {
    this.hasBeenClicked2 = true;
  }
  clickOutside2(): void {
    this.hasBeenClickedOutside2 = true;
  }
  click3(): void {
    this.hasBeenClicked3 = true;
  }
  clickOutside3(): void {
    this.hasBeenClickedOutside3 = true;
  }
}

describe('ClickAwareDirective', () => {
  let fixture: ComponentFixture<TestClickAwareDirectiveComponent>;
  let component: TestClickAwareDirectiveComponent;
  let deadElement: DebugElement;
  let liveElement: DebugElement;
  let ignoreClassesElement: DebugElement;
  let ignoreWhenElement: DebugElement;
  let innerElement: DebugElement;
  let clickService: ClickService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClickAwareDirective, TestClickAwareDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestClickAwareDirectiveComponent);
    clickService = TestBed.inject(ClickService);
    deadElement = fixture.debugElement.query(By.css('.dead-zone'));
    liveElement = fixture.debugElement.query(By.css('.live-zone'));
    ignoreClassesElement = fixture.debugElement.query(By.css('.ignore-classes'));
    ignoreWhenElement = fixture.debugElement.query(By.css('.ignore-when'));
    innerElement = fixture.debugElement.query(By.css('.inner-element'));
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.debugElement.nativeElement.addEventListener('click', (event: Event) => {
      if (event.target) {
        clickService.documentClickedTarget.next(event.target as HTMLElement);
      }
    });
  });

  it('should create', () => {
    const clickInfo = component.clickInfo;
    expect(clickInfo).toBeTruthy();
  });

  it('should call the "documentClickListener" method when clicked', () => {
    const onClickMock = spyOn(component, 'click1').and.callThrough();
    fixture.debugElement.query(By.css('.dead-zone')).triggerEventHandler('click', null);

    deadElement.nativeElement.click();
    expect(onClickMock).not.toHaveBeenCalled();

    liveElement.nativeElement.click();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should detect clicks outside', () => {
    expect(component.hasBeenClickedOutside1).toBeFalsy();
    deadElement.nativeElement.click();
    expect(component.hasBeenClickedOutside1).toBeTruthy();
  });

  it('should not detect clicks outside from ignored classes', () => {
    fixture.debugElement.query(By.css('.ignore-me')).nativeElement.click();
    expect(component.hasBeenClickedOutside3).toBeFalsy();
    ignoreWhenElement.nativeElement.click();
    expect(component.hasBeenClickedOutside3).toBeTruthy();
  });

  it('should not detect clicks outside from ignored conditions', () => {
    deadElement.nativeElement.click();
    liveElement.nativeElement.click();
    ignoreClassesElement.nativeElement.click();
    expect(component.hasBeenClickedOutside2).toBeFalsy();
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

    expect(clickInfo.isClickedInside).toBeFalsy();

    clickService.documentClickedTarget.next(deadElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeFalsy();

    clickService.documentClickedTarget.next(innerElement.nativeElement);
    expect(clickInfo.isClickedInside).toBeTruthy();
  });
});
