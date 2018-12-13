export class MockTranslateService {
  public use(_: string): void {
    // console.log('translateService.use is deprecated');
  }

  public instant(key: string): string {
    return `en:${key}`;
  }
}
