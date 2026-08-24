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

  it('should dynamically calculate steps matching the sorted numerical keys of the inner map configuration', async () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      2: { step: true },
      0: { step: true },
      1: { step: true }
    };
    fixture.componentRef.setInput('classMapInner', mockInnerRecord);

    // Push the microtask graph synchronously so the computed 'steps' updates before evaluation
    await TestBed.flushEffects();
    fixture.detectChanges();

    // 🚀 FIXED: Asserts correct behavior since steps derives from classMapInner keys, not the count input
    expect(component.steps()).toEqual([0, 1, 2]);
  });

  it('should extract sequential indices for tooltips when active keys are non-contiguous', async () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      1: { 'metadata-tier-orb': true } // Content skipped, only metadata is present
    };

    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.componentRef.setInput('tooltips', ['Only Metadata Tooltip Text Here']);

    await TestBed.flushEffects();
    fixture.detectChanges();

    // 🚀 REFACTORED: Verifies the pre-calculated view map layout mapping index 1 to the first array text element
    const mappedItem = component.orbItemsMap()[1];
    expect(mappedItem).toBeDefined();
    expect(mappedItem.tooltip).toBe('Only Metadata Tooltip Text Here');
  });

  it('should append login suffix text and override tabIndex configurations if an orb is marked locked', async () => {
    const mockInnerRecord: Record<number, ClassMap> = {
      0: { locked: true }
    };
    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.componentRef.setInput('tooltips', ['Base Tooltip String']);
    fixture.componentRef.setInput('tabIndex', 0);

    await TestBed.flushEffects();
    fixture.detectChanges();

    const mappedItem = component.orbItemsMap()[0];
    expect(mappedItem.tooltip).toBe('Base Tooltip String (log in to enable)');
    expect(mappedItem.tabIndex).toBe(-1); // Tabindex forced to -1 when locked or active
  });

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
