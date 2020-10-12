import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockAuthenticationService } from '../../_mocked';
import { AuthenticationService } from '../../_services';
import { SearchComponent } from '.';
import { LoginComponent } from '../../login';

import { MockActivatedRoute } from '../../_mocked';

describe('SearchComponent', () => {
  const searchString = '123';
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let router: Router;
  let auth: AuthenticationService;

  const beforeEachAsync = (): void => {
    const mar = new MockActivatedRoute();
    mar.setQueryParams({ searchString: searchString });
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './signin', component: LoginComponent },
          { path: './search', component: SearchComponent }
        ])
      ],
      declarations: [SearchComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ActivatedRoute, useValue: mar }
      ]
    }).compileComponents();
  };

  const beforeEachInitialisation = (): void => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthenticationService);
    fixture.detectChanges();
  };

  describe('with query param:', () => {
    beforeEach(async(beforeEachAsync));
    beforeEach(beforeEachInitialisation);

    it('should initialise its value on initialisation', () => {
      expect(component.searchString).toEqual(searchString);
    });

    it('should execute a search (with endpoint)', () => {
      spyOn(router, 'navigate');
      component.apiEndpoint = '/signin';
      expect(component.searchString).toBeTruthy();
      component.executeSearch();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should execute a search (with no endpoint)', () => {
      spyOn(component.onExecute, 'emit');
      expect(component.searchString).toBeTruthy();
      component.executeSearch();
      expect(component.onExecute.emit).toHaveBeenCalled();
    });

    it('should execute a search on return (key event)', () => {
      spyOn(router, 'navigate');
      component.apiEndpoint = '/search';
      component.submitOnEnter(({ key: '1' } as unknown) as KeyboardEvent);
      expect(router.navigate).not.toHaveBeenCalled();
      component.submitOnEnter(({ key: 'Enter' } as unknown) as KeyboardEvent);
      expect(router.navigate).toHaveBeenCalledWith(
        [component.apiEndpoint],
        Object({ queryParams: Object({ searchString: '123' }) })
      );
    });
  });

  describe('without query param:', () => {
    beforeEach(async(beforeEachAsync));
    beforeEach(beforeEachInitialisation);

    it('should not execute a search if not authenticated', () => {
      auth.logout();
      spyOn(router, 'navigate');
      component.apiEndpoint = '/search';
      component.executeSearch();
      expect(router.navigate).toHaveBeenCalledWith(['/signin']);
    });
  });
});
