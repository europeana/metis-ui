import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockAuthenticationService, MockTranslateService } from '../_mocked';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';
import { TranslateService } from '../_translate';

import { LoginComponent } from '.';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [LoginComponent, createMockPipe('translate')],
      providers: [
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.checkLogin = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login', fakeAsync((): void => {
    component.loginForm.controls.email.setValue('mocked@mocked.com');
    component.loginForm.controls.password.setValue('mocked123');

    spyOn(router, 'navigate');
    tick(50);

    component.onSubmit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should redirect if already logged in', fakeAsync((): void => {
    component.loginForm.controls.email.setValue('mocked@mocked.com');
    component.loginForm.controls.password.setValue('mocked123');

    spyOn(router, 'navigate');
    tick(50);
    component.checkLogin = true;
    component.onSubmit();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should redirect if already logged in on load', fakeAsync((): void => {
    spyOn(router, 'navigate');
    tick(50);
    component.checkLogin = true;
    component.ngOnInit();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should not login for empty passwords', fakeAsync((): void => {
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    spyOn(router, 'navigate');
    tick(50);
    component.onSubmit();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
