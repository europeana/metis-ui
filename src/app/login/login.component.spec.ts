import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationType } from '../_models';
import {
  createMockPipe,
  MockAuthenticationService,
  MockRedirectPreviousUrl,
  MockTranslateService
} from '../_mocked';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';
import { TranslateService } from '../_translate';

import { LoginComponent } from '.';

describe('LoginComponent', () => {
  let authenticationService: AuthenticationService;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let redirectPreviousUrl: RedirectPreviousUrl;
  const userName = 'mocked@mocked.com';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [LoginComponent, createMockPipe('translate')],
      providers: [
        { provide: RedirectPreviousUrl, useClass: MockRedirectPreviousUrl },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.get(Router);
    redirectPreviousUrl = TestBed.get(RedirectPreviousUrl);
    authenticationService = TestBed.get(AuthenticationService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.checkLogin = false;
    fixture.detectChanges();
    authenticationService.login('name', 'pw');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login', fakeAsync((): void => {
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('mocked123');

    spyOn(router, 'navigate');
    tick(50);
    component.onSubmit();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should redirect if already logged in', fakeAsync((): void => {
    component.loginForm.controls.email.setValue(userName);
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
    component.checkLogin = true;
    component.ngOnInit();
    fixture.detectChanges();
    tick(50);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should not login for empty passwords', fakeAsync((): void => {
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(50);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should not login for wrong passwords', fakeAsync((): void => {
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('error');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(50);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should not login when an 404 error occurs', fakeAsync((): void => {
    expect(component.notification).toBeFalsy();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('404');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(50);
    expect(component.notification).toBeTruthy();
    expect(component.notification!.type).toBe(NotificationType.ERROR);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should not login when an 406 error occurs', fakeAsync((): void => {
    expect(component.notification).toBeFalsy();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('406');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(50);
    expect(component.notification).toBeTruthy();
    expect(component.notification!.type).toBe(NotificationType.ERROR);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should not login when an 406 error occurs', fakeAsync((): void => {
    expect(component.notification).toBeFalsy();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('406');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(50);
    expect(component.notification).toBeTruthy();
    expect(component.notification!.type).toBe(NotificationType.ERROR);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should redirect after login', fakeAsync((): void => {
    spyOn(router, 'navigate');
    component.redirectAfterLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should redirect to the previous url after login', fakeAsync((): void => {
    const mockPrevUrl = 'dataset/workflow/123';
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
    redirectPreviousUrl.set(mockPrevUrl);
    component.redirectAfterLogin();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith(`/${mockPrevUrl}`);
  }));
});
