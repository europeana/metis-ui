import { TestBed } from '@angular/core/testing';
import { ThemeService } from './';

describe('ThemeService', () => {

  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: []
    }).compileComponents();
    service = TestBed.inject(ThemeService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should switch the theme', () => {
    expect(service.themeIndex()).toEqual(0);
    service.switchTheme();
    expect(service.themeIndex()).toEqual(1);
    service.switchTheme();
    expect(service.themeIndex()).toEqual(0);
  });
});
