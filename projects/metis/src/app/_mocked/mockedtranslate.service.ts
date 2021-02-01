export class MockTranslateService {
  public instant(key: string): string {
    return `en:${key}`;
  }
}
