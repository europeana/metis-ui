import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should switch the theme', () => {
    expect(service.themeIndex()).toBe(0);

    service.switchTheme();
    expect(service.themeIndex()).toBe(1);

    service.switchTheme();
    expect(service.themeIndex()).toBe(2);

    service.switchTheme();
    expect(service.themeIndex()).toBe(0);
  });
});
