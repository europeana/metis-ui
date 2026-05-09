import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopOutComponent } from '.';

describe('PopOutComponent', () => {
  let component: PopOutComponent;
  let fixture: ComponentFixture<PopOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [PopOutComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers(); // Ensure timers are restored after every test
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click outside', () => {
    const closeSpy = vi.spyOn(component.close, 'emit');
    const userCloseSpy = vi.spyOn(component, 'userClosesPanel');

    // 1. Initial State: MUST be open for the logic to execute
    component.isOpen.set(true);
    component.clickOutside();

    expect(closeSpy).toHaveBeenCalled();
    expect(userCloseSpy).toHaveBeenCalled(); // Logic reached because it was open
    expect(component.isOpen()).toBe(false); // Verify it closed it

    // 2. Test that it DOES NOT run logic when already closed
    closeSpy.mockClear(); // Reset counts
    component.clickOutside();
    expect(closeSpy).not.toHaveBeenCalled();

    // 3. Test focus target logic
    const focusSpy = vi.fn();
    (component as any).openers = () => ({
      nativeElement: {
        querySelector: () => ({ focus: focusSpy })
      }
    });

    component.isOpen.set(true); // Open it again
    component.clickOutside(true); // Trigger with focusOpener = true
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should handle the fnClassMapOuter', async () => {
    expect(component.fnClassMapOuter()(0)['test']).toBeFalsy();
    fixture.componentRef.setInput('fnClassMapOuter', () => ({ test: true }));
    TestBed.flushEffects();
    expect(component.fnClassMapOuter()(0)['test']).toBeTruthy();
  });

  it('should handle the fnClassMapInner', async () => {
    const config = component.fnClassMapInner()(0) as any;
    expect(config['is-active']).toBeFalsy();

    fixture.componentRef.setInput('fnClassMapInner', () => ({ 'custom-class': true }));
    fixture.componentRef.setInput('openerCount', 1);
    TestBed.flushEffects();

    component.isOpen.set(true);
    TestBed.flushEffects();

    const updatedConfig = component.fnClassMapInner()(0) as any;
    expect(updatedConfig['is-active']).toBeTruthy();
    expect(updatedConfig['custom-class']).toBeTruthy();
  });

  it('should open', () => {
    expect(component.isOpen()).toBeFalsy();
    component.toggleOpen(0);
    expect(component.isOpen()).toBeTruthy();
    component.toggleOpen(0);
    expect(component.isOpen()).toBeFalsy();
  });

  it('should handle nav orb clicks', () => {
    const toggleSpy = vi.spyOn(component, 'toggleOpen');

    fixture.componentRef.setInput('openerCount', 2);
    component.navOrbsClick(1);
    expect(toggleSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('openerCount', 1);
    component.navOrbsClick(1);
    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should handle the user closing the panel', () => {
    vi.useFakeTimers();
    expect(component.userClosedPanel()).toBeFalsy();

    component.userClosesPanel();
    expect(component.userClosedPanel()).toBeTruthy();

    vi.advanceTimersByTime(component.closeTime - 1);
    expect(component.userClosedPanel()).toBeTruthy();

    vi.advanceTimersByTime(2);
    expect(component.userClosedPanel()).toBeFalsy();
  });

  it('should notify when loading finishes while closed', async () => {
    // 1. Reset
    fixture.componentRef.setInput('isLoading', false);
    component.isOpen.set(false);
    fixture.detectChanges();
    TestBed.flushEffects();

    // 2. Transition to true
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges(); // Sync view
    TestBed.flushEffects(); // Trigger effect to see currentlyLoading = true
    await fixture.whenStable();

    // 3. Transition back to false
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges(); // Sync view
    TestBed.flushEffects(); // Trigger effect to see transition
    await fixture.whenStable();

    expect(component.notify()).toBe(true);
  });

  it('should clear notify', () => {
    component.notify.set(true);
    component.toggleOpen(0);
    expect(component.notify()).toBeFalsy();
  });
});
