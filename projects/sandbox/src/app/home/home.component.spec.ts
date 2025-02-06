import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from '.';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit events', () => {
    spyOn(component.appEntryLink, 'emit');
    component.clickEvent(({} as unknown) as Event);
    expect(component.appEntryLink.emit).toHaveBeenCalled();
  });
});
