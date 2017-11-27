import { HomePage } from './home.po';

describe('Home | Page', () => {
  let page: HomePage;

  beforeEach(() => {
    page = new HomePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getWelcomeMessage()).toEqual('What can you do with Metis?');
  });
});
