import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { MockAuthenticationService, MockTranslateService } from '../_mocked';
import { AuthenticationService, ErrorService, RedirectPreviousUrl } from '../_services';
import { TranslatePipe, TranslateService } from '../_translate';

import { ProfileComponent } from '.';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      declarations: [ProfileComponent, TranslatePipe],
      providers: [
        ErrorService,
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload the profile form', () => {
    component.editMode = false;
    fixture.detectChanges();

    const reload = fixture.debugElement.query(By.css('#refresh-btn'));
    reload.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.notification!.content).toBe('Your profile has been updated');
  });

  it('should submit the form', () => {
    component.editMode = false;
    component.toggleEditMode();
    fixture.detectChanges();

    const submit = fixture.debugElement.query(By.css('.submit'));
    submit.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.notification!.content).toBe('Update password successful!');
  });
});
