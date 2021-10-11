import { TranslateService, Translations } from '.';

describe('translate service', () => {
  let service: TranslateService;
  const mockTranslations: Translations = {
    nl: {
      hello: 'Hallo',
      world: 'Wereld'
    },
    en: {
      hello: 'Hello',
      world: 'World'
    }
  };

  beforeEach(() => {
    service = new TranslateService(mockTranslations);
    console.log(!!service);
  });

  afterEach(() => {
    localStorage.removeItem('currentLang');
  });

  it('show take the language from localStorage', () => {
    expect(service.currentLang).toBe('en');
    localStorage.setItem('currentLang', 'nl');
    service = new TranslateService(mockTranslations);
    expect(service.currentLang).toBe('nl');
  });

  it('should translate a string', () => {
    localStorage.setItem('currentLang', 'nl');
    service = new TranslateService(mockTranslations);
    expect(service.instant('hello')).toBe('Hallo');
    expect(service.instant('world')).toBe('Wereld');
  });

  it('should return an unknown label', () => {
    expect(service.instant('bye')).toBe('bye');
  });

  it('should change the language', () => {
    spyOn(service, 'reload');
    service.changeLang('de');
    expect(localStorage.getItem('currentLang')).toBe('de');
    expect(service.reload).toHaveBeenCalledWith();
  });
});
