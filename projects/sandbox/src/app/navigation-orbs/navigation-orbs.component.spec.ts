import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationOrbsComponent } from './navigation-orbs.component';
import { ClassMap } from 'shared';

describe('NavigationOrbsComponent', () => {
  let component: NavigationOrbsComponent;
  let fixture: ComponentFixture<NavigationOrbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationOrbsComponent]
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

    // ✅ Fix: Evaluate inputs as true read-only Angular Signals via ()
    const outerMap = component.classMapOuter();
    const innerMap = component.classMapInner();

    expect(outerMap).toEqual({});
    expect(innerMap).toEqual({});
  });

  it('should cleanly extract positional style objects using loop indexing markers', () => {
    // Arrange: Provide an index-keyed Record dictionary layout configuration input
    const mockInnerRecord: Record<number, ClassMap> = {
      0: { 'active-orb': true },
      1: { 'disabled-orb': true }
    };

    fixture.componentRef.setInput('classMapInner', mockInnerRecord);
    fixture.detectChanges();

    // Act: Extract layout snapshots directly from the signal evaluation result
    const innerSignalValue = component.classMapInner();

    // Assert: Verify individual loop rows match index configurations safely
    expect(innerSignalValue[0]).toEqual({ 'active-orb': true });
    expect(innerSignalValue[1]).toEqual({ 'disabled-orb': true });
  });
});
