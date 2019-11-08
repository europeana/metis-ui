import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockAuthenticationService } from '../../_mocked';
import { AuthenticationService } from '../../_services';

import { SearchComponent } from '.';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let router: Router;
  let auth: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SearchComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: AuthenticationService, useClass: MockAuthenticationService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    auth = TestBed.get(AuthenticationService);
  });

  it('should execute a search', () => {
    spyOn(router, 'navigate');
    component.executeSearch();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should not execute a search if not authenticated', () => {
    spyOn(router, 'navigate');
    spyOn(auth, 'validatedUser').and.callFake(() => {
      return false;
    });
    component.executeSearch();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should execute a search on return (key event)', () => {
    spyOn(router, 'navigate');
    component.submitOnEnter(({ which: 1 } as unknown) as KeyboardEvent);
    expect(router.navigate).not.toHaveBeenCalled();
    component.submitOnEnter(({ which: 13 } as unknown) as KeyboardEvent);
    expect(router.navigate).toHaveBeenCalled();
  });
});
