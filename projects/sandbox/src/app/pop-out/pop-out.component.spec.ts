import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PopOutComponent } from '.';

describe('PopOutComponent', () => {
  let component: PopOutComponent;
  let fixture: ComponentFixture<PopOutComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [PopOutComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open', () => {
    expect(component.isOpen).toBeFalsy();
    component.toggleOpen();
    expect(component.isOpen).toBeTruthy();
    component.toggleOpen();
    expect(component.isOpen).toBeFalsy();
  });

  it('should emit open events', () => {
    spyOn(component.onOpen, 'emit');
    component.toggleOpen();
    expect(component.onOpen.emit).toHaveBeenCalled();
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
  });

  it('should clear notifications', () => {
    component.notify = true;
    component.toggleOpen();
    expect(component.notify).toBeFalsy();
  });
});
