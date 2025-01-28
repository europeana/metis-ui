import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';
import { PopOutComponent } from '.';

describe('PopOutComponent', () => {
  let component: PopOutComponent;
  let fixture: ComponentFixture<PopOutComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [PopOutComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click outside', () => {
    spyOn(component.close, 'emit');
    spyOn(component, 'userClosesPanel');
    component.clickOutside();
    expect(component.close.emit).toHaveBeenCalled();
    expect(component.userClosesPanel).not.toHaveBeenCalled();
    component.isOpen = true;
    component.clickOutside();
    expect(component.close.emit).toHaveBeenCalledTimes(2);
    expect(component.userClosesPanel).toHaveBeenCalled();
  });

  it('should handle the fnClassMapOuter', () => {
    expect(component.fnClassMapOuter(0).test).toBeFalsy();
    component.fnClassMapOuter = (): ClassMap => {
      return { test: true };
    };
    expect(component.fnClassMapOuter(0).test).toBeTruthy();
  });

  it('should handle the fnClassMapInner', () => {
    expect(component.fnClassMapInner(0)['is-active']).toBeFalsy();
    component.fnClassMapInner = (): ClassMap => {
      return {};
    };
    expect(component.fnClassMapInner(0)['is-active']).toBeFalsy();
    component.openerCount = 1;
    expect(component.fnClassMapInner(0)['is-active']).toBeFalsy();
    component.isOpen = true;
    expect(component.fnClassMapInner(0)['is-active']).toBeTruthy();
    component.applyDefaultNotification = true;
    expect(component.fnClassMapInner(0)['warning-animated']).toBeFalsy();
    component.notify = true;
    expect(component.fnClassMapInner(0)['warning-animated']).toBeTruthy();
  });

  it('should open', () => {
    expect(component.isOpen).toBeFalsy();
    component.toggleOpen(0);
    expect(component.isOpen).toBeTruthy();
    component.toggleOpen(0);
    expect(component.isOpen).toBeFalsy();
  });

  it('should handle nav orb clicks', () => {
    spyOn(component, 'toggleOpen');
    component.openerCount = 2;
    component.navOrbsClick(1);
    expect(component.toggleOpen).not.toHaveBeenCalled();

    component.openerCount = 1;
    component.navOrbsClick(1);
    expect(component.toggleOpen).toHaveBeenCalled();
  });

  it('should handle the user closing the panel', fakeAsync(() => {
    expect(component.userClosedPanel).toBeFalsy();
    component.userClosesPanel();
    expect(component.userClosedPanel).toBeTruthy();
    tick(component.closeTime - 1);
    expect(component.userClosedPanel).toBeTruthy();
    tick(2);
    expect(component.userClosedPanel).toBeFalsy();
  }));

  it('should emit open events', () => {
    spyOn(component.open, 'emit');
    component.toggleOpen(3);
    expect(component.open.emit).toHaveBeenCalledWith(3);
  });

  it('should notify', () => {
    component.isLoading = false;
    component.isOpen = true;

    expect(component.notify).toBeFalsy();
    component.isLoading = true;
    expect(component.notify).toBeFalsy();
    component.isLoading = false;
    expect(component.notify).toBeFalsy();

    component.isOpen = false;
    component.isLoading = true;
    expect(component.notify).toBeFalsy();
    component.isLoading = false;
    expect(component.notify).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
  });

  it('should clear notify', () => {
    component.notify = true;
    component.toggleOpen(0);
    expect(component.notify).toBeFalsy();
  });
});
