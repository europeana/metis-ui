import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { PopOutComponent } from './pop-out.component';

describe('PopOutComponent (Vitest)', () => {
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

    // Provide default required or common input property structures
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

  describe('isLoading Signal Transform Context', () => {
    it('should not set notify when isLoading changes from false to true', async () => {
      componentRef.setInput('isLoading', true);
      await fixture.whenStable();

      expect(component.isLoading()).toBe(true);
      expect(component.notify()).toBe(false);
    });

    it('should set notify to true when isLoading transitions from true to false while closed', async () => {
      // Step A: Set to true first
      componentRef.setInput('isLoading', true);
      await fixture.whenStable();
      expect(component.isLoading()).toBe(true);

      // Step B: Set back to false while component is closed
      componentRef.setInput('isLoading', false);
      await fixture.whenStable();

      expect(component.isLoading()).toBe(false);
      expect(component.notify()).toBe(true);
    });

    it('should not set notify when isLoading transitions to false but the component panel is open', async () => {
      // Step A: Set to true and open the component
      componentRef.setInput('isLoading', true);
      component.isOpen.set(true);
      await fixture.whenStable();

      // Step B: Turn loading off
      componentRef.setInput('isLoading', false);
      await fixture.whenStable();

      expect(component.isLoading()).toBe(false);
      expect(component.notify()).toBe(false);
    });
  });

  describe('Computed Class Conversions', () => {
    it('should resolve classMapOuterRecord values correctly', async () => {
      const mockOuter = { 'custom-outer-frame': true };
      componentRef.setInput('classMapOuter', mockOuter);
      await fixture.whenStable();

      expect(component.classMapOuterRecord()[0]).toEqual(mockOuter);
      expect(component.classMapOuterRecord()[1]).toEqual(mockOuter);
    });

    it('should dynamically append default loading status definitions to classMapInnerRecord', async () => {
      componentRef.setInput('classMapInner', { 'user-custom-class': true });
      componentRef.setInput('isLoading', true);
      await fixture.whenStable();

      const innerConfig0 = component.classMapInnerRecord()[0];
      expect(innerConfig0['spinner']).toBe(true);
      expect(innerConfig0['indicator-orb']).toBe(true);
      expect(innerConfig0['user-custom-class']).toBe(true);
    });

    it('should safely map multi-index nested class structures', async () => {
      const customIndexedClasses = {
        0: { 'left-orb-style': true },
        1: { 'right-orb-style': true }
      };
      componentRef.setInput('classMapInner', customIndexedClasses);
      await fixture.whenStable();

      expect(component.classMapInnerRecord()[0]['left-orb-style']).toBe(true);
      expect(component.classMapInnerRecord()[1]['right-orb-style']).toBe(true);
    });
  });

  describe('Component Actions & Outputs', () => {
    it('should emit a close transaction on a valid clickOutside action', async () => {
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

      // Inject mock viewChild element reference tracking
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
      component.isOpen.set(false); // Closed initially

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
});
