import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchResultsComponent } from '.';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createMockPipe,
  MockActivatedRoute,
  MockAuthenticationService,
  MockDatasetsService,
  MockDatasetsServiceErr
} from '../_mocked';
import { AuthenticationService, DatasetsService } from '../_services';

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let component: SearchResultsComponent;
  let authenticationService: AuthenticationService;
  let router: Router;
  const searchTerm = '123';

  const configureTestbed = (searchErr = false, qParam?: string): void => {
    const mar = new MockActivatedRoute();
    if (qParam) {
      mar.setParams({ searchString: qParam });
    }
    TestBed.configureTestingModule({
      declarations: [SearchResultsComponent, createMockPipe('translate')],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mar },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: DatasetsService,
          useClass: searchErr ? MockDatasetsServiceErr : MockDatasetsService
        }
      ]
    }).compileComponents();
    authenticationService = TestBed.get(AuthenticationService);
    router = TestBed.get(Router);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  };

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true, searchTerm);
    }));

    beforeEach(b4Each);

    it('should not have results', () => {
      expect(component.results).toBeFalsy();
    });

    it('should not be loading', () => {
      expect(component.isLoading).toBeFalsy();
    });

    it('should redirect if the user is not validated', () => {
      expect(component.userValidated).toBeTruthy();
      spyOn(router, 'navigate');
      authenticationService.logout();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  describe('with query param:', () => {
    beforeEach(async(() => {
      configureTestbed(false, searchTerm);
    }));

    beforeEach(b4Each);

    it('should set the document title to the search result', () => {
      expect(document.title).toContain(`Search Results | ${searchTerm}`);
    });

    it('should have results', () => {
      expect(component.results).toBeTruthy();
    });

    it('should load more', () => {
      expect(component.currentPage).toBe(0);
      spyOn(component, 'load');
      component.isLoading = true;
      component.loadNextPage();
      expect(component.load).toHaveBeenCalled();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('without query param:', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the document title', () => {
      expect(document.title).not.toContain(`Search Results | ${searchTerm}`);
      expect(document.title).toContain('Search Results');
    });
  });
});
