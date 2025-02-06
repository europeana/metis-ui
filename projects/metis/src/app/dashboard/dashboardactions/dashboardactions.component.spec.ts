import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { createMockPipe, MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';

import { DashboardactionsComponent } from '.';

describe('DashboardactionsComponent', () => {
  let component: DashboardactionsComponent;
  let fixture: ComponentFixture<DashboardactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardactionsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
