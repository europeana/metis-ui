import { TranslateService } from '../_translate';

export class MockTranslateService extends TranslateService {
  public constructor() {
    super({});
  }

  protected translate(key: string): string {
    return this.currentLang + ':' + key;
  }
}
