import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { AuthenticationService, DatasetsService, TranslateService } from '../_services';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../_translate';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockAuthenticationService, currentUser } from '../_mocked';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule ],
      declarations: [ DashboardComponent, TranslatePipe ], 
      providers: [ { provide: AuthenticationService, useClass: MockAuthenticationService}, 
        DatasetsService, 
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        }
       ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open log messages', () => {
    component.onNotifyShowLogStatus('mocked message');
    expect(component.isShowingLog).not.toBe(false);
  });

});
