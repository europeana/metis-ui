import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameComponent } from '.';

describe('UsernameComponent', () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UsernameComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(UsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
