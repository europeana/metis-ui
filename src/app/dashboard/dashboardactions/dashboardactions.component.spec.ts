import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MockTranslateService } from '../../_mocked';
import { TranslateService } from '../../_services';
import { TranslatePipe } from '../../_translate';

import { DashboardactionsComponent } from './dashboardactions.component';

describe('DashboardactionsComponent', () => {
  let component: DashboardactionsComponent;
  let fixture: ComponentFixture<DashboardactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardactionsComponent, TranslatePipe],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }],
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
