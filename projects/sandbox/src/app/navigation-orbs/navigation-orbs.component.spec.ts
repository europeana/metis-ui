import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NavigationOrbsComponent } from './navigation-orbs.component';
import { ClassMap } from 'shared';

describe('NavigationOrbsComponent', () => {
  let component: NavigationOrbsComponent;
  let fixture: ComponentFixture<NavigationOrbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationOrbsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationOrbsComponent);
    component = fixture.componentInstance;
  });

  it('should compile cleanly with default parameters', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize input dictionaries with empty fallback states correctly', () => {
    fixture.detectChanges();

    const outerMap = component.classMapOuter();
    const innerMap = component.classMapInner();

    expect(outerMap).toEqual({});
    expect(innerMap).toEqual({});
  });

  it('should cleanly extract positional style objects using loop indexing markers', () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      0: { 'active-orb': true },
      1: { 'disabled-orb': true }
    };

    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.detectChanges();

    const innerSignalValue = component.classMapInner();

    expect(innerSignalValue[0]).toEqual({ 'active-orb': true });
    expect(innerSignalValue[1]).toEqual({ 'disabled-orb': true });
  });

  it('should dynamically fallback to a sequential array length if inner configuration records are empty', () => {
    fixture.componentRef.setInput('count', 3);

    // 🚀 FIXED: Push the microtask graph synchronously so the computed 'steps' updates before evaluation!
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.steps()).toEqual([0, 1, 2]);
  });

  // 🚀 ADDED: Verifies the special dynamic array indexing tooltip fallback mapping logic
  it('should extract sequential indices for tooltips when active keys are non-contiguous', () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      1: { 'metadata-tier-orb': true } // Content skipped, only metadata is present
    };

    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.componentRef.setInput('tooltips', ['Only Metadata Tooltip Text Here']);
    fixture.detectChanges();

    // Passing index 1 should safely yield position 0 inside the visible tooltips collection array
    expect(component.getTooltip(1)).toBe('Only Metadata Tooltip Text Here');
  });

  // 🚀 ADDED: Verifies event bubbling and protection rules when a node flags a 'locked' style
  it('should block click events and prevent bubble processing if an orb is marked locked', () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      0: { locked: true }
    };
    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.detectChanges();

    const mockEvent = { ctrlKey: false, preventDefault: vi.fn() };
    const emitSpy = vi.spyOn(component.clickEvent, 'emit');

    component.clicked(mockEvent, 0);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
