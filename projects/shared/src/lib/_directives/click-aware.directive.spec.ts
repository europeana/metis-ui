import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
  provideZonelessChangeDetection,
  ViewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
        <!-- Added a nested element to force the while loop parent traversal -->
        <span class="nested-ignore-wrapper ignore-me">
          <span class="deep-nested-child">DEEP CHILD</span>
        </span>
      </div>
    </div>
  `,
  styles: ['.collapsed{ background-color: red; }']
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ClickAwareDirective, TestClickAwareDirectiveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(TestClickAwareDirectiveComponent);
    clickService = TestBed.inject(ClickService);
    deadElement = fixture.debugElement.query(By.css('.dead-zone'));
    liveElement = fixture.debugElement.query(By.css('.live-zone'));
    ignoreClassesElement = fixture.debugElement.query(By.css('.ignore-classes'));
    ignoreWhenElement = fixture.debugElement.query(By.css('.ignore-when'));
    innerElement = fixture.debugElement.query(By.css('.inner-element'));
    component = fixture.componentInstance;

    await fixture.whenStable();
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

  it('should call the "documentClickListener" method when clicked', async () => {
    const onClickMock = vi.spyOn(component, 'click1');

    fixture.debugElement.query(By.css('.dead-zone')).triggerEventHandler('click', null);
    await fixture.whenStable();

    deadElement.nativeElement.click();
    await fixture.whenStable();
    expect(onClickMock).not.toHaveBeenCalled();

    liveElement.nativeElement.click();
    await fixture.whenStable();
    expect(onClickMock).toHaveBeenCalled();
  });

  it('should detect clicks outside', async () => {
    expect(component.hasBeenClickedOutside1).toBeFalsy();
    deadElement.nativeElement.click();
    await fixture.whenStable();
    expect(component.hasBeenClickedOutside1).toBeTruthy();
  });

  it('should not detect clicks outside from ignored classes directly or through parent nesting', async () => {
    const directIgnoreNode = ignoreClassesElement.nativeElement.querySelector('.ignore-me');
    directIgnoreNode.click();
    await fixture.whenStable();
    expect(component.hasBeenClickedOutside3).toBeFalsy();

    const deepNestedNode = ignoreClassesElement.nativeElement.querySelector('.deep-nested-child');
    deepNestedNode.click();
    await fixture.whenStable();
    expect(component.hasBeenClickedOutside3).toBeFalsy();

    // Verify normal outside click works to hit the negative loop branch
    ignoreWhenElement.nativeElement.click();
    await fixture.whenStable();
    expect(component.hasBeenClickedOutside3).toBeTruthy();
  });

  it('should not detect clicks outside from ignored conditions', async () => {
    deadElement.nativeElement.click();
    await fixture.whenStable();
    liveElement.nativeElement.click();
    await fixture.whenStable();
    ignoreClassesElement.nativeElement.click();
    await fixture.whenStable();
    expect(component.hasBeenClickedOutside2).toBeFalsy();
  });

  it('should detect clicks in the element', async () => {
    const clickInfo = component.clickInfo;

    expect(clickInfo.isClickedInside).toBeFalsy();

    clickInfo.documentClickListener(liveElement.nativeElement, deadElement.nativeElement);
    await fixture.whenStable();
    expect(clickInfo.isClickedInside).toBeFalsy();

    clickInfo.documentClickListener(liveElement.nativeElement, innerElement.nativeElement);
    await fixture.whenStable();
    expect(clickInfo.isClickedInside).toBeTruthy();
  });

  it('should detect clicks in the element via the service', async () => {
    const clickInfo = component.clickInfo;

    expect(clickInfo.isClickedInside).toBeFalsy();

    clickService.documentClickedTarget.next(deadElement.nativeElement);
    await fixture.whenStable();
    expect(clickInfo.isClickedInside).toBeFalsy();

    clickService.documentClickedTarget.next(innerElement.nativeElement);
    await fixture.whenStable();
    expect(clickInfo.isClickedInside).toBeTruthy();
  });
});
