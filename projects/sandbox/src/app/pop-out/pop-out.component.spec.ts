import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopOutComponent } from './pop-out.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ClassMap } from 'shared';

// 1. Mock Navigation Orbs Child Component Stub to bypass template checks safely
@Component({
  selector: 'sb-navigation-orbs',
  template: '',
  standalone: true
})
class MockNavigationOrbsComponent {
  @Input() count = 0;
  @Input() tooltips: string[] = [];
  @Input() tabIndex?: number;
  @Input() classMapInner: Record<number, ClassMap> = {};
  @Input() classMapOuter: Record<number, ClassMap> = {};
  @Output() clickEvent = new EventEmitter<number>();
}

describe('PopOutComponent', () => {
  let component: PopOutComponent;
  let fixture: ComponentFixture<PopOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopOutComponent, MockNavigationOrbsComponent]
    })
      .overrideComponent(PopOutComponent, {
        remove: { imports: [] },
        add: { imports: [MockNavigationOrbsComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
  });

  it('should compile cleanly with default parameters', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should correctly project incoming outer class configurations across index positions', () => {
    // Arrange: Set a custom ClassMap input configuration property payload mapping
    fixture.componentRef.setInput('classMapOuter', { test: true });
    fixture.detectChanges();

    // Act: Read the modern computed record signal dictionary state natively
    const outerRecord = component.classMapOuterRecord();

    // Assert: Verify that both child loop indices (0 and 1) resolve to your configuration
    expect(outerRecord[0]).toBeDefined();
    expect(outerRecord[0]['test']).toBeTruthy();
    expect(outerRecord[1]['test']).toBeTruthy();
  });

  it('should merge parent inner configurations over native element default classes cleanly', () => {
    // Arrange: Simulate opening a single-item pop-out view dashboard
    fixture.componentRef.setInput('openerCount', 1);
    component.isOpen.set(true);
    fixture.componentRef.setInput('classMapInner', { 'custom-override': true });
    fixture.detectChanges();

    // Act: Read the modern computed inner record signal dictionary state natively
    const innerRecord = component.classMapInnerRecord();
    const configAtIndexZero = innerRecord[0];

    // Assert: Verify that defaults ('is-active') and custom entries merge correctly at index 0
    expect(configAtIndexZero).toBeDefined();
    expect(configAtIndexZero['is-active']).toBeTruthy();
    expect(configAtIndexZero['custom-override']).toBeTruthy();
  });

  it('should strip out the active indicator states when single opener panels are closed', () => {
    fixture.componentRef.setInput('openerCount', 1);
    component.isOpen.set(false); // Forced Close Panel Sequence Pass
    fixture.detectChanges();

    const innerRecord = component.classMapInnerRecord();

    // Assert: The guard rule overrides 'is-active' to false for the loop slots natively
    expect(innerRecord[0]['is-active']).toBeFalsy();
    expect(innerRecord[1]['is-active']).toBeFalsy();
  });
});
