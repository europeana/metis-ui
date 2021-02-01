import { MockTranslateService } from '../_mocked';

import { TranslatePipe, TranslateService } from '.';

describe('translate pipe', () => {
  it('should translate', () => {
    const translateService = new MockTranslateService() as TranslateService;
    const pipe = new TranslatePipe(translateService);
    expect(pipe.transform('hello')).toBe('en:hello');
  });

  it('should handle an empty value', () => {
    const translateService = new MockTranslateService() as TranslateService;
    const pipe = new TranslatePipe(translateService);
    expect(pipe.transform('')).toBe(undefined);
  });
});
