import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassMap } from 'shared';
import { NavigationOrbsComponent } from '.';

describe('NavigationOrbsComponent', () => {
  let component: NavigationOrbsComponent;
  let fixture: ComponentFixture<NavigationOrbsComponent>;

  const configureTestbed = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [NavigationOrbsComponent]
    }).compileComponents();
  };

  const b4Each = async (): Promise<void> => {
    await configureTestbed();
    fixture = TestBed.createComponent(NavigationOrbsComponent);
    component = fixture.componentInstance;
    // Initial detection to set up signals
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await b4Each();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // fnClassMapOuter is a signal returning a function
    expect(component.fnClassMapOuter()(0)).toEqual({});
    expect(component.fnClassMapInner()(0)).toEqual({});
  });

  it('should set the indicator attributes', () => {
    expect(Object.keys(component.mappedIndicators()).length).toEqual(0);

    fixture.componentRef.setInput('indicatorAttributes', ['a', 'b']);
    TestBed.flushEffects();

    expect(Object.keys(component.mappedIndicators()).length).toEqual(2);
    expect(component.mappedIndicators()['0']).toEqual('a');
  });

  it('should get the modified tab index', () => {
    expect(component.getModifiedTabIndex(1)).toEqual(0);

    fixture.componentRef.setInput('tabIndex', 1);
    TestBed.flushEffects();
    expect(component.getModifiedTabIndex(1)).toEqual(1);

    const classMap: ClassMap = {
      locked: true,
      'is-active': false
    };

    // Override the function input
    fixture.componentRef.setInput('fnClassMapInner', () => classMap);
    TestBed.flushEffects();

    expect(component.getModifiedTabIndex(1)).toEqual(-1);

    classMap.locked = false;
    expect(component.getModifiedTabIndex(1)).toEqual(1);

    classMap['is-active'] = true;
    expect(component.getModifiedTabIndex(1)).toEqual(-1);
  });

  it('should get the tooltip', () => {
    const defTooltip = 'default tooltip';
    const tooltips = ['one', 'two', 'three'];

    fixture.componentRef.setInput('tooltips', tooltips);
    fixture.componentRef.setInput('tooltipDefault', defTooltip);
    TestBed.flushEffects();

    [0, 1, 2].forEach((index: number) => {
      expect(component.getTooltip(index)).toEqual(tooltips[index]);
    });

    fixture.componentRef.setInput('tooltips', []);
    TestBed.flushEffects();

    [0, 1, 2].forEach((index: number) => {
      expect(component.getTooltip(index)).toEqual(defTooltip);
    });
  });

  it('should collapse and uncollapse according to the count', () => {
    expect(component.collapsed()).toBeFalsy();

    fixture.componentRef.setInput('count', NavigationOrbsComponent.maxOrbsUncollapsed + 1);
    TestBed.flushEffects();
    expect(component.collapsed()).toBeTruthy();

    fixture.componentRef.setInput('count', NavigationOrbsComponent.maxOrbsUncollapsed);
    TestBed.flushEffects();
    expect(component.collapsed()).toBeFalsy();
  });

  it('should allow the maxUncollapsed to be set', () => {
    expect(component.collapsed()).toBeFalsy();

    fixture.componentRef.setInput('count', 10);
    TestBed.flushEffects();
    expect(component.collapsed()).toBeTruthy();

    fixture.componentRef.setInput('maxUncollapsed', 10);
    TestBed.flushEffects();
    // Count is 10, max is 10, so it should not be collapsed (count > max)
    expect(component.collapsed()).toBeFalsy();
  });

  it('should not emit an event when locked', () => {
    const emitSpy = vi.spyOn(component.clickEvent, 'emit');
    let isLocked = true;
    const event = { preventDefault: vi.fn(), ctrlKey: false };

    fixture.componentRef.setInput('fnClassMapInner', () => ({ locked: isLocked }));
    TestBed.flushEffects();

    component.clicked(event, 0);
    expect(emitSpy).not.toHaveBeenCalled();

    isLocked = false;
    // Re-provide the function to refresh the closure if necessary,
    // or just rely on the mutable object if preferred.
    fixture.componentRef.setInput('fnClassMapInner', () => ({ locked: isLocked }));
    TestBed.flushEffects();

    component.clicked(event, 0);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit an event when clicked', () => {
    const event = { preventDefault: vi.fn(), ctrlKey: true };
    const index = 5;
    const emitSpy = vi.spyOn(component.clickEvent, 'emit');

    component.clicked(event, index);
    expect(emitSpy).not.toHaveBeenCalled();

    event.ctrlKey = false;
    component.clicked(event, index);
    expect(emitSpy).toHaveBeenCalledWith(index);
  });

  it('should emit an event when the next/prev buttons are clicked', () => {
    const index = 10;
    const emitSpy = vi.spyOn(component.clickEvent, 'emit');

    fixture.componentRef.setInput('index', index);
    TestBed.flushEffects();

    component.clickedNext();
    expect(emitSpy).toHaveBeenCalledWith(index + 1);

    component.clickedPrev();
    expect(emitSpy).toHaveBeenCalledWith(index - 1);
  });
});
