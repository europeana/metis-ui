import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let component: SearchResultsComponent;
  const searchTerm = '123';

  const configureTestbed = (searchErr = false, qParam?: string): void => {
    const mar = new MockActivatedRoute();
    if (qParam) {
      mar.setQueryParams({ searchString: qParam });
    }
    TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mar },
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

  const b4Each = fakeAsync((): void => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    tick(1);
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

    it('should unsubscribe when destroyed', () => {
      let called = false;
      spyOn(component.subs[0], 'unsubscribe').and.callFake(() => {
        called = true;
      });
      component.ngOnDestroy();
      expect(called).toBeTruthy();
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
