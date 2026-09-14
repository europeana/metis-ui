import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

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

  const configureTestbed = (searchErr = false, qParam?: string): void => {
    mockActivatedRoute = new MockActivatedRoute();
    if (qParam) {
      mockActivatedRoute.setQueryParams({ searchString: qParam });
    }
    TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
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
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jasmine.clock().tick(5);
    fixture.detectChanges();
  };

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true, searchTerm);
      b4Each();
    });

    it('should not have results', () => {
      expect(component.results).toBeFalsy();
    });

    it('should not be loading', () => {
      expect(component.isLoading).toBeFalsy();
    });
  });

  describe('with query param:', () => {
    beforeEach(() => {
      configureTestbed(false, searchTerm);
      b4Each();
    });

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
    beforeEach(() => {
      configureTestbed();
      b4Each();
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
