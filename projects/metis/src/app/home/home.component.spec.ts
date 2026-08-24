import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { HomeComponent } from './home.component';
import { DocumentTitleService } from '../_services';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let documentTitleService: DocumentTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        MockProvider(DocumentTitleService, {
          setTitle: jasmine.createSpy('setTitle')
        })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    documentTitleService = TestBed.inject(DocumentTitleService);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize static banner and hero image configuration constants inside the constructor', () => {
    expect(component.heroimage).toBe('url(/assets/images/hero_metis_1600x650_jade.png)');
    expect(component.bannerheading).toBe('What can you do with Metis?');
    expect(component.bannertext).toContain('automagically digest huge amounts of data');
    expect(component.attributiontext).toBe(
      'Cyclopides metis L., Cyclopides qua... Museum Fur Naturkunde Berlin'
    );
    expect(component.attributionlink).toBe('https://www.europeana.eu/portal/');
    expect(component.attributionrights).toBe('CC0');
    expect(component.attributionrightslink).toBe(
      'https://creativecommons.org/publicdomain/zero/1.0/'
    );
  });

  it('should call DocumentTitleService to update the application header title on initialization', () => {
    // 🚀 THE FIXED SPY REFERENCE MATCHING JASMINE
    component.ngOnInit();
    expect(documentTitleService.setTitle).toHaveBeenCalledWith('Welcome');
  });
});
