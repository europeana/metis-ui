import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardactionsComponent } from './dashboardactions.component';
import { TranslateService } from '../../_services';
import { TRANSLATION_PROVIDERS, TranslatePipe } from '../../_translate';

describe('DashboardactionsComponent', () => {
  let component: DashboardactionsComponent;
  let fixture: ComponentFixture<DashboardactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardactionsComponent, TranslatePipe ],
      providers: [ { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        } ]
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
