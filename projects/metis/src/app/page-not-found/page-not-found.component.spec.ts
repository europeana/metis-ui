import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DocumentTitleService } from '../_services';
import { PageNotFoundComponent } from '.';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let mockRouter: any;
  let mockDocumentTitleService: any;

  beforeEach(() => {
    mockRouter = {
      url: '/some-invalid-route',
      getCurrentNavigation: jasmine.createSpy('getCurrentNavigation').and.returnValue({
        previousNavigation: {
          finalUrl: '/previous-valid-page'
        }
      }),
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockDocumentTitleService = {
      setTitle: jasmine.createSpy('setTitle')
    };

    TestBed.configureTestingModule({
      imports: [PageNotFoundComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DocumentTitleService, useValue: mockDocumentTitleService }
      ]
    }).compileComponents();
  });

  it('should create and extract the previous URL from the router history', () => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.badurl).toBe('/some-invalid-route');
    expect(component.returnUrl()).toBe('/previous-valid-page');
  });

  it('should fall back to /home if no previous navigation history exists', () => {
    mockRouter.getCurrentNavigation.and.returnValue(null);
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.returnUrl()).toBe('/home');
  });

  it('should set the document title on initialisation', () => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(mockDocumentTitleService.setTitle).toHaveBeenCalledWith('Page Not Found');
  });

  it('should navigate to the returnUrl when back() is executed', () => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.back();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/previous-valid-page');
  });
});
