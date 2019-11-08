import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultsComponent } from '.';

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let component: SearchResultsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultsComponent]
    });
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set the document title', () => {
    fixture.detectChanges();
    expect(document.title).toContain('Search Results');
  });
});
