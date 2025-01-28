import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingButtonComponent } from '.';

describe('LoadingButtonComponent', () => {
  let component: LoadingButtonComponent;
  let fixture: ComponentFixture<LoadingButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoadingButtonComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
