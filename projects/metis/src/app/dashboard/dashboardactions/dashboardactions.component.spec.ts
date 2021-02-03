import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from '../../_mocked';

import { DashboardactionsComponent } from '.';

describe('DashboardactionsComponent', () => {
  let component: DashboardactionsComponent;
  let fixture: ComponentFixture<DashboardactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardactionsComponent, createMockPipe('translate')]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
