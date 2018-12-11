import { TranslateService } from '../_translate';

export class MockTranslateService extends TranslateService {
  public constructor() {
    super({});
  }

  public instant(key: string): string {
    return this.currentLang + ':' + key;
  }
}
