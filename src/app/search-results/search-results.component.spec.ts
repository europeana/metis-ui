import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultsComponent } from '.';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from '../_mocked';

describe('SearchResultsComponent', () => {
  describe('with query param:', () => {
    let fixture: ComponentFixture<SearchResultsComponent>;

    beforeEach(async(() => {
      const mar = new MockActivatedRoute();
      mar.setParams({ q: '123' });
      TestBed.configureTestingModule({
        declarations: [SearchResultsComponent],
        providers: [{ provide: ActivatedRoute, useValue: mar }]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SearchResultsComponent);
      fixture.detectChanges();
    });

    it('should set the document title to the search result', () => {
      expect(document.title).toContain('Search Results | 123');
    });
  });

  describe('without query param:', () => {
    let fixture: ComponentFixture<SearchResultsComponent>;
    let component: SearchResultsComponent;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [SearchResultsComponent],
        providers: [{ provide: ActivatedRoute, useValue: new MockActivatedRoute() }]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SearchResultsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the document title', () => {
      fixture.detectChanges();
      expect(document.title).not.toContain('Search Results | 123');
      expect(document.title).toContain('Search Results');
    });
  });
});
