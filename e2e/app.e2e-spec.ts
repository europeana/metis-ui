import { AppPage } from './app.po';

describe('metis App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getWelcomeMessage()).toEqual('What can you do with Metis?');
  });
});
