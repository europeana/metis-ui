import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PopOutComponent } from './pop-out.component';

describe('PopOutComponent (Vitest Zoneless)', () => {
  let component: PopOutComponent;
  let componentRef: ComponentRef<PopOutComponent>;
  let fixture: ComponentFixture<PopOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopOutComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('openerCount', 1);
    componentRef.setInput('applyDefaultNotification', true);
    component.isOpen.set(false);
    component.notify.set(false);

    fixture.detectChanges();
  });

  it('should initialize with custom default configurations', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.notify()).toBe(false);
    expect(component.userClosedPanel()).toBe(false);
    expect(component.ignoreClassesList).toContain('pop-out-content');
  });

  describe('isLoading Signal Effect Validation', () => {
    it('should not set notify when isLoading changes from false to true', async () => {
      componentRef.setInput('isLoading', true);

      // Flush the template signals and execution effect queue
      TestBed.flushEffects();
      // Yield to the microtask queue (Promise.resolve() loop)
      await Promise.resolve();

      expect(component.isLoading()).toBe(true);
      expect(component.notify()).toBe(false);
    });

    it('should set notify to true when isLoading transitions from true to false while closed', async () => {
      // Step A: Set to true first
      componentRef.setInput('isLoading', true);
      TestBed.flushEffects();
      await Promise.resolve();
      expect(component.isLoading()).toBe(true);

      // Step B: Set back to false while component is closed
      componentRef.setInput('isLoading', false);
      TestBed.flushEffects();
      await Promise.resolve();

      expect(component.isLoading()).toBe(false);
      expect(component.notify()).toBe(true);
    });

    it('should not set notify when isLoading transitions to false but the component panel is open', async () => {
      // Step A: Set to true and open the component
      componentRef.setInput('isLoading', true);
      component.isOpen.set(true);
      TestBed.flushEffects();
      await Promise.resolve();

      // Step B: Turn loading off
      componentRef.setInput('isLoading', false);
      TestBed.flushEffects();
      await Promise.resolve();

      expect(component.isLoading()).toBe(false);
      expect(component.notify()).toBe(false);
    });
  });

  describe('Computed Class Conversions', () => {
    it('should resolve classMapOuterRecord values correctly', () => {
      const mockOuter = { 'custom-outer-frame': true };
      componentRef.setInput('classMapOuter', mockOuter);

      // Computed records resolve immediately upon signal access
      expect(component.classMapOuterRecord()[0]).toEqual(mockOuter);
    });

    it('should dynamically append default loading status definitions to classMapInnerRecord', () => {
      componentRef.setInput('classMapInner', { 'user-custom-class': true });
      componentRef.setInput('isLoading', true);

      const innerConfig0 = component.classMapInnerRecord()[0];
      expect(innerConfig0['spinner']).toBe(true);
      expect(innerConfig0['indicator-orb']).toBe(true);
      expect(innerConfig0['user-custom-class']).toBe(true);
    });

    it('should safely map multi-index nested class structures', () => {
      const customIndexedClasses = {
        0: { 'left-orb-style': true },
        1: { 'right-orb-style': true }
      };
      componentRef.setInput('classMapInner', customIndexedClasses);

      expect(component.classMapInnerRecord()[0]['left-orb-style']).toBe(true);
      expect(component.classMapInnerRecord()[1]['right-orb-style']).toBe(true);
    });
  });

  describe('Component Actions & Outputs', () => {
    it('should emit a close transaction on a valid clickOutside action', () => {
      const emitSpy = vi.spyOn(component.close, 'emit');
      component.isOpen.set(true);

      component.clickOutside();

      expect(component.isOpen()).toBe(false);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should focus the inner DOM elements if focusOpener parameter is passed', () => {
      const mockElement = document.createElement('div');
      const mockOrb = document.createElement('button');
      mockOrb.className = 'nav-orb';
      mockElement.appendChild(mockOrb);

      const focusSpy = vi.spyOn(mockOrb, 'focus');

      Object.defineProperty(component, 'openers', {
        value: () => ({ nativeElement: mockElement }),
        configurable: true
      });

      component.clickOutside(true);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should clean up the notifications and emit an open parameter value on toggleOpen', () => {
      const emitSpy = vi.spyOn(component.open, 'emit');
      component.notify.set(true);
      component.isOpen.set(false);

      component.toggleOpen(5);

      expect(component.isOpen()).toBe(true);
      expect(component.notify()).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith(5);
    });

    it('should invoke toggleOpen on navOrbsClick actions if openerCount is precisely 1', () => {
      componentRef.setInput('openerCount', 1);
      const toggleSpy = vi.spyOn(component, 'toggleOpen');

      component.navOrbsClick(2);

      expect(toggleSpy).toHaveBeenCalledWith(2);
    });

    it('should directly force an open transition without toggling if openerCount is larger than 1', () => {
      componentRef.setInput('openerCount', 2);
      const emitSpy = vi.spyOn(component.open, 'emit');
      component.isOpen.set(false);
      component.notify.set(true);

      component.navOrbsClick(3);

      expect(component.isOpen()).toBe(true);
      expect(component.notify()).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith(3);
    });
  });

  describe('Class Record Object Fallbacks', () => {
    it('should return empty records if class maps are non-objects or invalid', () => {
      componentRef.setInput('classMapOuter', null as any);
      componentRef.setInput('classMapInner', undefined as any);

      expect(component.classMapOuterRecord()).toEqual({});
      expect(component.classMapInnerRecord()).toEqual({});
    });

    it('should map a multi-indexed outer class structure safely', () => {
      const customIndexedOuter = {
        0: { 'outer-style-0': true },
        1: { 'outer-style-1': true }
      };
      componentRef.setInput('classMapOuter', customIndexedOuter);

      expect(component.classMapOuterRecord()[0]['outer-style-0']).toBe(true);
      expect(component.classMapOuterRecord()[1]['outer-style-1']).toBe(true);
    });
  });

  describe('Toggle and Interceptor Closing Chains', () => {
    it('should trigger close logic loops when toggleOpen is executed on an open panel', () => {
      const closeSpy = vi.spyOn(component.close, 'emit');
      vi.spyOn(component, 'userClosesPanel');
      component.isOpen.set(true);

      component.toggleOpen(0);

      expect(component.isOpen()).toBe(false);
      expect(component.userClosesPanel).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should simply force an open signal emit on navOrbsClick if openerCount > 1 and already open', () => {
      componentRef.setInput('openerCount', 2);
      const openSpy = vi.spyOn(component.open, 'emit');
      component.isOpen.set(true);
      component.notify.set(false);

      component.navOrbsClick(4);

      expect(component.isOpen()).toBe(true);
      expect(component.notify()).toBe(false);
      expect(openSpy).toHaveBeenCalledWith(4);
    });
  });

  describe('Panel Closing Timeout Metrics', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should flip userClosedPanel state flags during closeTime timeouts', () => {
      expect(component.userClosedPanel()).toBe(false);

      component.userClosesPanel();
      expect(component.userClosedPanel()).toBe(true);

      // Advance clock by the assigned closeTime configuration (400ms)
      vi.advanceTimersByTime(400);
      expect(component.userClosedPanel()).toBe(false);
    });

    it('should cleanly clear active timeout handlers upon structural component destruction', () => {
      const clearSpy = vi.spyOn(global, 'clearTimeout');

      component.ngOnDestroy();
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('Unasserted Inputs and Transform Variations', () => {
    it('should evaluate the default fallback states on all remaining unasserted signal inputs', () => {
      // 🛠️ COVERS: Baseline configuration inputs
      expect(component.disabled()).toBe(false);
      expect(component.tooltips()).toEqual([]);
      expect(component.tabIndex()).toBeUndefined();
    });

    it('should evaluate the negative transformation branches inside isLoadingInput', async () => {
      // Branch A: previousValue is false (should NOT trigger notify flag)
      componentRef.setInput('isLoading', false);
      TestBed.flushEffects();
      await Promise.resolve();
      expect(component.notify()).toBe(false);

      // Branch B: previousValue is true, newValue is false, BUT panel is open (should NOT trigger notify flag)
      componentRef.setInput('isLoading', true);
      component.isOpen.set(true);
      TestBed.flushEffects();
      await Promise.resolve();

      componentRef.setInput('isLoading', false);
      TestBed.flushEffects();
      await Promise.resolve();
      expect(component.notify()).toBe(false);
    });
  });
});
