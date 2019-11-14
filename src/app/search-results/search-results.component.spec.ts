import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultsComponent } from '.';
import { ActivatedRoute } from '@angular/router';
import {
  createMockPipe,
  MockActivatedRoute,
  MockDatasetsService,
  MockDatasetsServiceErr
} from '../_mocked';
import { DatasetsService } from '../_services';

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let component: SearchResultsComponent;
  const searchTerm = '123';

  const configureTestbed = (searchErr = false, qParam?: string): void => {
    const mar = new MockActivatedRoute();
    if (qParam) {
      mar.setParams({ q: qParam });
    }
    TestBed.configureTestingModule({
      declarations: [SearchResultsComponent, createMockPipe('translate')],
      providers: [
        { provide: ActivatedRoute, useValue: mar },
        {
          provide: DatasetsService,
          useClass: searchErr ? MockDatasetsServiceErr : MockDatasetsService
        }
      ]
    }).compileComponents();
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
