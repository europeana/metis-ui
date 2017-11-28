import { NotfoundPage } from './notfound.po';

describe('Page | Notfound', () => {
  let page: NotfoundPage;

  beforeAll(() => {
    page = new NotfoundPage();
    page.navigateTo();
  });

  it('should display error message', () => {
    expect(page.getErrorMessage()).toEqual('404 Not Found');
  });
});
