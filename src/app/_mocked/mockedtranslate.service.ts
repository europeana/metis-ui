import { TranslateService } from '../_services';

export class MockTranslateService extends TranslateService {
  public constructor() {
    super({});
  }

  protected translate(key: string): string {
    return this.currentLang + ':' + key;
  }
}
