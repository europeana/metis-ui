import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MockAuthenticationService, MockTranslateService } from '../_mocked';
import {
  AuthenticationService,
  ErrorService,
  RedirectPreviousUrl,
  TranslateService,
} from '../_services';
import { TranslatePipe } from '../_translate';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      declarations: [LoginComponent, TranslatePipe],
      providers: [
        RedirectPreviousUrl,
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
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

    spyOn(router, 'navigate').and.callFake(() => {});
    tick(50);

    component.onSubmit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));
});
