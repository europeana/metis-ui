import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoginComponent } from './login.component';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { RedirectPreviousUrl, TranslateService, AuthenticationService, ErrorService } from '../_services';
import { TRANSLATION_PROVIDERS, TranslatePipe } from '../_translate';

import { MockAuthenticationService, MockTranslateService } from '../_mocked';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule, ReactiveFormsModule ],
      declarations: [ LoginComponent, TranslatePipe ],
      providers: [ RedirectPreviousUrl, ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    })
    .compileComponents();

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

    spyOn(router, 'navigate').and.callFake(() => { });
    tick(50);

    component.onSubmit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

});

