import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthenticationService } from '../_services';

// Can't bind to 'passwordToCheck' since it isn't a known property of 'app-password-check'.
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule ],
      declarations: [ RegisterComponent ],
      providers: [ AuthenticationService, FlashMessagesService ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
