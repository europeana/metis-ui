import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core'; // ✅ Added zoneless testing helper utility
import { NavigationOrbsComponent } from './navigation-orbs.component';
import { ClassMap } from 'shared';

describe('NavigationOrbsComponent', () => {
  let component: NavigationOrbsComponent;
  let fixture: ComponentFixture<NavigationOrbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationOrbsComponent],
      providers: [
        provideZonelessChangeDetection() // ✅ THE FIX: Forces the testing engine to pass without requiring Zone.js
      ]
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
});
