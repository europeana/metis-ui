import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockAuthenticationService } from '../../_mocked';
import { AuthenticationService } from '../../_services';
import { SearchComponent } from '.';
import { MockActivatedRoute } from '../../_mocked';

describe('SearchComponent', () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let router: Router;
  let auth: AuthenticationService;

  const beforeEachInitialisation = (): void => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    auth = TestBed.get(AuthenticationService);
    auth.login('name', 'pw');
    fixture.detectChanges();
  };

  describe('with query param:', () => {
    const searchString = '123';

    beforeEach(async(() => {
      const mar = new MockActivatedRoute();
      mar.setQueryParams({ searchString: searchString });
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [SearchComponent, createMockPipe('translate')],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: AuthenticationService, useClass: MockAuthenticationService },
          { provide: ActivatedRoute, useValue: mar }
        ]
      }).compileComponents();
    }));

    beforeEach(beforeEachInitialisation);

    it('should initialise its value on initialisation', () => {
      expect(component.searchString).toEqual(searchString);
    });

    it('should execute a search', () => {
      spyOn(router, 'navigate');
      expect(component.searchString).toBeTruthy();
      component.executeSearch();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should execute a search on return (key event)', () => {
      spyOn(router, 'navigate');
      component.submitOnEnter(({ which: 1 } as unknown) as KeyboardEvent);
      expect(router.navigate).not.toHaveBeenCalled();
      component.submitOnEnter(({ which: 13 } as unknown) as KeyboardEvent);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/search'],
        Object({ queryParams: Object({ searchString: '123' }) })
      );
    });
  });

  describe('without query param:', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [SearchComponent, createMockPipe('translate')],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [{ provide: AuthenticationService, useClass: MockAuthenticationService }]
      }).compileComponents();
    }));

    beforeEach(beforeEachInitialisation);

    it('should not execute a search if not authenticated', () => {
      auth.logout();
      spyOn(router, 'navigate');
      component.executeSearch();
      expect(router.navigate).toHaveBeenCalledWith(['/signin']);
    });
  });
});
