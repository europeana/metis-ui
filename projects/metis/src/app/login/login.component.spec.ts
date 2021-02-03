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
import { DashboardComponent } from '../dashboard';
import { LoginComponent } from '.';

describe('LoginComponent', () => {
  let authenticationService: AuthenticationService;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let redirectPreviousUrl: RedirectPreviousUrl;

  const interval = 5000;
  const userName = 'mocked@mocked.com';
  const mockPrevUrl = 'dataset/workflow/123';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dashboard', component: DashboardComponent },
          { path: mockPrevUrl, component: DashboardComponent }
        ]),
        ReactiveFormsModule
      ],
      declarations: [LoginComponent, createMockPipe('translate')],
      providers: [
        { provide: RedirectPreviousUrl, useClass: MockRedirectPreviousUrl },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.inject(Router);
    redirectPreviousUrl = TestBed.inject(RedirectPreviousUrl);
    authenticationService = TestBed.inject(AuthenticationService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    authenticationService.logout();
  });

  afterEach(fakeAsync(() => {
    authenticationService.logout();
    component.cleanup();
    tick(interval);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login', fakeAsync((): void => {
    component.ngOnInit();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('mocked123');

    spyOn(router, 'navigate');
    component.onSubmit();
    const sub = authenticationService.login('name', 'pw').subscribe();

    tick(interval);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    sub.unsubscribe();
    component.cleanup();
    tick(interval);
  }));

  it('should redirect if already logged in', fakeAsync((): void => {
    component.ngOnInit();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('mocked123');

    spyOn(router, 'navigate');
    component.onSubmit();
    tick(1);

    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    component.cleanup();
    tick(interval);
  }));

  it('should redirect if already logged in on load', fakeAsync((): void => {
    spyOn(router, 'navigate');
    const sub = authenticationService.login('name', 'pw').subscribe();
    component.ngOnInit();
    tick(interval);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    sub.unsubscribe();
    component.cleanup();
    tick(interval);
  }));

  it('should redirect if a user logs in is detected after the initial load', fakeAsync((): void => {
    spyOn(router, 'navigate');
    component.ngOnInit();
    tick(interval);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    const sub = authenticationService.login('name', 'pw').subscribe();
    tick(interval);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    sub.unsubscribe();
    component.cleanup();
    tick(interval);
  }));

  it('should not login for empty passwords', fakeAsync((): void => {
    component.ngOnInit();
    component.loginForm.controls.email.setValue('');
    component.loginForm.controls.password.setValue('');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(interval);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    component.cleanup();
    tick(interval);
  }));

  it('should not login for wrong passwords', fakeAsync((): void => {
    component.ngOnInit();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('error');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(1);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    component.cleanup();
    tick(interval);
  }));

  it('should not login when an 404 error occurs', fakeAsync((): void => {
    expect(component.notification).toBeFalsy();
    component.loginForm.controls.email.setValue(userName);
    component.loginForm.controls.password.setValue('404');
    spyOn(router, 'navigate');
    component.onSubmit();
    tick(1);
    fixture.detectChanges();
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
    tick(interval);
    fixture.detectChanges();
    expect(component.notification).toBeTruthy();
    expect(component.notification!.type).toBe(NotificationType.ERROR);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should redirect after login', fakeAsync((): void => {
    component.ngOnInit();
    spyOn(router, 'navigate');
    component.redirectAfterLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    component.cleanup();
    tick(interval);
  }));

  it('should redirect to the previous url after login', (): void => {
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
    redirectPreviousUrl.set(mockPrevUrl);
    component.redirectAfterLogin();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith(`/${mockPrevUrl}`);
  });
});
