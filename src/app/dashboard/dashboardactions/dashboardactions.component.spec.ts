import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardactionsComponent } from './dashboardactions.component';

describe('DashboardactionsComponent', () => {
  let component: DashboardactionsComponent;
  let fixture: ComponentFixture<DashboardactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardactionsComponent ]
    })
    .compileComponents();
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
