import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MockTranslateService } from '../../_mocked';
import { TranslatePipe, TranslateService } from '../../_translate';

import { ExecutionsComponent } from './executions.component';

describe('ExecutionsComponent', () => {
  let component: ExecutionsComponent;
  let fixture: ComponentFixture<ExecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ExecutionsComponent, TranslatePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
