import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { createMockPipe } from 'shared';
import {
  MockActivatedRoute,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService
} from '../_mocked';
import { DatasetsService } from '../_services';
import { TranslatePipe, TranslateService } from '../_translate';
import { SearchResultsComponent } from '.';

describe('SearchResultsComponent (Zoneless + Jasmine Clock)', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let component: SearchResultsComponent;
  let mockActivatedRoute: MockActivatedRoute;
  const searchTerm = '123';

  const configureTestbed = (searchErr = false, qParam?: string, previousUrl?: string): void => {
    mockActivatedRoute = new MockActivatedRoute();
    if (qParam) {
      mockActivatedRoute.setQueryParams({ searchString: qParam });
    }

    TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: DatasetsService,
          useClass: searchErr ? MockDatasetsServiceErrors : MockDatasetsService
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue(
      previousUrl
        ? { previousNavigation: { finalUrl: previousUrl } } as any
        : null
    );
  };

  const b4Each = async (): Promise<void> => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    jasmine.clock().tick(5);

    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('Navigation returnUrl behavior:', () => {
    it('should fallback to /dashboard if there is no previous navigation route context', async () => {
      configureTestbed(false, undefined, undefined);
      await b4Each();
      expect(component.returnUrl()).toBe('/dashboard');
    });

    it('should correctly capture the real previous URL path string when provided', async () => {
      const originPath = '/dataset/details/45';
      configureTestbed(false, undefined, originPath);
      await b4Each();
      expect(component.returnUrl()).toBe(originPath);
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true, searchTerm);
      await b4Each();
    });

    it('should not have results', () => {
      expect(component.results()).toHaveSize(0);
    });

    it('should not be loading', () => {
      expect(component.isLoading()).toBeFalsy();
    });
  });

  describe('with query param:', () => {
    beforeEach(async () => {
      configureTestbed(false, searchTerm);
      await b4Each();
    });

    it('should set the document title to the search result', () => {
      expect(document.title).toContain(`Search Results | ${searchTerm}`);
    });

    it('should have results', () => {
      expect(component.results().length).toBeGreaterThan(0);
    });

    it('should load more', () => {
      expect(component.currentPage()).toBe(0);
      spyOn(component, 'load');

      component.isLoading.set(true);
      component.loadNextPage();
      expect(component.load).toHaveBeenCalled();

      expect(component.currentPage()).toBe(1);
    });
  });

  describe('without query param:', () => {
    beforeEach(async () => {
      configureTestbed();
      await b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the document title', () => {
      expect(document.title).not.toContain(`Search Results | ${searchTerm}`);
      expect(document.title).toContain('Search Results');
    });
  });
});
